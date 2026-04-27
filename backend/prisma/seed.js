// TEMPLATE FILE — part of admin-template v1.0
require('dotenv').config({ path: require('path').join(__dirname, '../.env') })
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const modulesConfig = require('../src/config/modules.config')

const prisma = new PrismaClient()

async function main() {
  console.log('\n🌱 Seeding database...\n')

  // 1. Extract all permissions from modules config
  const allPermissions = modulesConfig.flatMap((mod) =>
    mod.permissions.map((name) => ({
      name,
      module: mod.label,
      description: `${name} permission`,
    }))
  )

  // Upsert all permissions
  for (const perm of allPermissions) {
    await prisma.permission.upsert({
      where: { name: perm.name },
      update: { module: perm.module },
      create: perm,
    })
  }
  console.log(`✓ Upserted ${allPermissions.length} permissions`)

  // 2. Create roles
  const roles = [
    { name: 'Admin', description: 'Full access to all features' },
    { name: 'Editor', description: 'Can view, create and edit. No delete or role management.' },
    { name: 'Viewer', description: 'Read-only access to all modules' },
    { name: 'Moderator', description: 'Can view and moderate content' },
  ]

  const createdRoles = {}
  for (const role of roles) {
    const r = await prisma.role.upsert({
      where: { name: role.name },
      update: { description: role.description },
      create: role,
    })
    createdRoles[role.name] = r
  }
  console.log(`✓ Upserted ${roles.length} roles`)

  // 3. Fetch all permissions from DB
  const dbPermissions = await prisma.permission.findMany()
  const permByName = Object.fromEntries(dbPermissions.map((p) => [p.name, p]))

  // 4. Assign permissions to Admin (all)
  for (const perm of dbPermissions) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: createdRoles.Admin.id, permissionId: perm.id } },
      update: {},
      create: { roleId: createdRoles.Admin.id, permissionId: perm.id },
    })
  }
  console.log(`✓ Admin role: assigned all ${dbPermissions.length} permissions`)

  // 5. Editor: view + create + edit on most modules, no delete, no role/permission mgmt
  const editorExclude = ['roles.delete', 'roles.create', 'roles.edit', 'permissions.edit', 'users.delete']
  const editorPerms = dbPermissions.filter((p) => {
    if (editorExclude.includes(p.name)) return false
    if (p.name.endsWith('.delete')) return false
    return true
  })
  for (const perm of editorPerms) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: createdRoles.Editor.id, permissionId: perm.id } },
      update: {},
      create: { roleId: createdRoles.Editor.id, permissionId: perm.id },
    })
  }
  console.log(`✓ Editor role: assigned ${editorPerms.length} permissions`)

  // 6. Viewer: only .view permissions
  const viewerPerms = dbPermissions.filter((p) => p.name.endsWith('.view'))
  for (const perm of viewerPerms) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: createdRoles.Viewer.id, permissionId: perm.id } },
      update: {},
      create: { roleId: createdRoles.Viewer.id, permissionId: perm.id },
    })
  }
  console.log(`✓ Viewer role: assigned ${viewerPerms.length} permissions`)

  // 7. Moderator: view + edit on most
  const moderatorPerms = dbPermissions.filter((p) => p.name.endsWith('.view') || p.name.endsWith('.edit'))
  for (const perm of moderatorPerms) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: createdRoles.Moderator.id, permissionId: perm.id } },
      update: {},
      create: { roleId: createdRoles.Moderator.id, permissionId: perm.id },
    })
  }
  console.log(`✓ Moderator role: assigned ${moderatorPerms.length} permissions`)

  // 8. Create default admin user
  const passwordHash = await bcrypt.hash('Admin@1234', 12)
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@admin.com' },
    update: {},
    create: {
      name: 'Super Admin',
      email: 'admin@admin.com',
      passwordHash,
      roleId: createdRoles.Admin.id,
      isActive: true,
    },
  })
  console.log(`✓ Admin user: admin@admin.com / Admin@1234`)

  console.log('\n✅ Seeding complete!\n')
  console.log('┌─────────────────────────────────────────┐')
  console.log('│  Permissions:', String(dbPermissions.length).padStart(4), '                          │')
  console.log('│  Roles:      ', String(roles.length).padStart(4), '                          │')
  console.log('│  Admin user:  admin@admin.com           │')
  console.log('│  Password:    Admin@1234                │')
  console.log('└─────────────────────────────────────────┘\n')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())

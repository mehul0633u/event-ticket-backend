import { prisma } from "../src/config/prisma.js";
import {
  PERMISSIONS,
  ROLE_PERMISSIONS,
  ROLES,
  type PermissionTitle,
  type RoleTitle,
} from "../src/constants/authorization.js";

const seedAuthorization = async (): Promise<void> => {
  const roles = new Map<RoleTitle, string>();
  const permissions = new Map<PermissionTitle, string>();

  for (const title of Object.values(ROLES)) {
    const role = await prisma.role.upsert({
      where: { title },
      update: {},
      create: { title },
      select: { id: true },
    });

    roles.set(title, role.id);
  }

  for (const title of Object.values(PERMISSIONS)) {
    const permission = await prisma.permission.upsert({
      where: { title },
      update: {},
      create: { title },
      select: { id: true },
    });

    permissions.set(title, permission.id);
  }

  for (const [roleTitle, permissionTitles] of Object.entries(
    ROLE_PERMISSIONS,
  ) as [RoleTitle, readonly PermissionTitle[]][]) {
    const roleId = roles.get(roleTitle);

    if (!roleId) {
      throw new Error(`Seeded role not found: ${roleTitle}`);
    }

    for (const permissionTitle of permissionTitles) {
      const permissionId = permissions.get(permissionTitle);

      if (!permissionId) {
        throw new Error(`Seeded permission not found: ${permissionTitle}`);
      }

      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId,
            permissionId,
          },
        },
        update: {},
        create: {
          roleId,
          permissionId,
        },
      });
    }
  }
};

seedAuthorization()
  .then(() => {
    console.log("Roles and permissions seeded successfully.");
  })
  .catch((error: unknown) => {
    console.error("Failed to seed roles and permissions.", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

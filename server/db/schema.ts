import { relations } from 'drizzle-orm'
import { sqliteTable, text, integer, uniqueIndex, unique } from 'drizzle-orm/sqlite-core'

// Users
export const users = sqliteTable('users', {
    id: text('id').primaryKey().unique(),
    name: text('name').notNull(),
})
export const usersRelations = relations(users, (r) => ({
    organizationsPeople: r.many(organizationsPeople)
}))

// Organizations
export const organizations = sqliteTable('organizations', {
    id: text('id').primaryKey().unique(),
    name: text('name').unique().notNull(),
    displayName: text('displayName').notNull(),
})
export const organizationsRelations = relations(organizations, (r) => ({
    organizationsPeople: r.many(organizationsPeople),
    apps: r.many(apps),
}))

// OrganizationsPeople
export const organizationsPeople = sqliteTable('organizationsPeople', {
    userId: text('userId').references(() => users.id),
    organizationId: text('organizationId').references(() => organizations.id),
}, (t) => ({
    userIdOrganizationId: unique().on(t.userId, t.organizationId),
}))
export const organizationsPeopleRelations = relations(organizationsPeople, (r) => ({
    user: r.one(users, {
        fields: [organizationsPeople.userId],
        references: [users.id],
    }),
    organization: r.one(organizations, {
        fields: [organizationsPeople.organizationId],
        references: [organizations.id],
    }),
}))

// Apps
export const apps = sqliteTable('apps', {
    id: text('id').primaryKey().unique(),
    name: text('name').notNull(),
    displayName: text('displayName').notNull(),
    osType: text('osType', {
        enum: ['android', 'ios']
    }),

    organizationsId: text('organizationsId').references(() => organizations.id),
}, (t) => ({
    organizationsId_name: unique().on(t.organizationsId, t.name),
}))
export const appsRelations = relations(apps, r => ({
    organization: r.one(organizations, {
        fields: [apps.organizationsId],
        references: [organizations.id],
    }),
    artifacts: r.many(artifacts),
    artifactsGroups: r.many(artifactsGroups),
}))

// Artifacts
export const artifacts = sqliteTable('artifacts', {
    id: text('id').primaryKey().unique(),
    fileObjectKey: text('fileObjectKey').notNull(),
    versionName: text('fileObjectKey').notNull().default(''),
    versionCode: text('fileObjectKey').notNull().default(''),
    releaseNotes: text('releaseNotes'),
    createdAt: integer('createdAt', {
        mode: 'timestamp_ms',
    }),
    updatedAt: integer('updatedAt', {
        mode: 'timestamp_ms',
    }),
    releaseId: integer('releaseId').notNull(),

    appsId: text('appsId').references(() => apps.id),
}, t => ({
    appsId_releaseId: unique().on(t.appsId, t.releaseId),
}))
export const artifactsRelations = relations(artifacts, t => ({
    apps: t.one(apps, {
        fields: [artifacts.appsId],
        references: [apps.id],
    }),
    artifactsGroupsManager: t.many(artifactsGroupsManager),
}))

// ArtifactsGroups
export const artifactsGroups = sqliteTable('artifactsGroups', {
    id: text('id').primaryKey().unique(),
    name: text('name').notNull(),
    appsId: text('appsId').references(() => apps.id),
}, t => ({
    appsId_releaseId: unique().on(t.appsId, t.name),
}))
export const artifactsGroupsRelations = relations(artifactsGroups, t => ({
    artifactsGroupsManager: t.many(artifactsGroupsManager),
    apps: t.one(apps, {
        fields: [artifactsGroups.appsId],
        references: [apps.id],
    }),
}))

// ArtifactsGroupsManger
export const artifactsGroupsManager = sqliteTable('artifactsGroupsManager', {
    artifactsId: text('artifactsId').notNull().references(() => artifacts.id),
    artifactsGroupsId: text('artifactsGroupsId').notNull().references(() => artifactsGroups.id),
}, t => ({
    artifactsId_artifactsGroupsId: unique().on(t.artifactsId, t.artifactsGroupsId),
}))
export const artifactsGroupsManagerRelations = relations(artifactsGroupsManager, t => ({
    artifacts: t.one(artifacts, {
        fields: [artifactsGroupsManager.artifactsId],
        references: [artifacts.id],
    }),
    artifactsGroups: t.one(artifactsGroups, {
        fields: [artifactsGroupsManager.artifactsGroupsId],
        references: [artifactsGroups.id],
    }),
}))

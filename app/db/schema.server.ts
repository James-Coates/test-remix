import { relations, sql } from "drizzle-orm";
import {
  customType,
  int,
  mysqlTable,
  primaryKey,
  serial,
  text,
  timestamp,
  tinyint,
  varchar,
} from "drizzle-orm/mysql-core";
// import wkx from "wkx";
// import { PROPERTY_TYPES } from "~/constants/property-type";
// import type { LatLng } from "~/types/latlng";

// const point = customType<{ data: LatLng | null; driverData: string }>({
//   dataType() {
//     return "point";
//   },
//   toDriver(value: LatLng | null) {
//     if (!value) {
//       return sql`null`;
//     }
//     return sql`Point(${value.lng}, ${value.lat})`;
//   },
//   fromDriver(value: string) {
//     if (typeof value !== "string") {
//       return value as any;
//     }

//     const buffer = Buffer.from(value.slice(4), "binary");
//     const geom = wkx.Geometry.parse(buffer) as wkx.Geometry & {
//       x: number;
//       y: number;
//     };
//     return { lng: geom.x, lat: geom.y };
//   },
// });

// export default point;

export const properties = mysqlTable("properties", {
  id: serial("id").primaryKey(),
  publicId: varchar("publicId", { length: 12 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  locationId: varchar("locationId", { length: 50 }),
  type: varchar("type", { length: 4, enum: ["rent", "sale"] }).notNull(),
  description: text("description"),
  price: int("price").notNull().default(0),
  // propertyType: varchar("propertyType", {
  //   length: 20,
  //   enum: Object.keys(PROPERTY_TYPES) as [
  //     "APARTMENT",
  //     "TOWNHOUSE",
  //     "HOUSE_OF_CHARACTER",
  //     "FARMHOUSE",
  //     "VILLA",
  //     "STUDIO_FLAT",
  //     "BLOCK_OF_APARTMENTS",
  //     "COTTAGE",
  //     "BUNGALOW",
  //     "PALAZZO",
  //     "LAND",
  //     "AGRICULTURE_LAND",
  //     "SITE",
  //     "PLOT",
  //     "AIRSPACE",
  //     "ROOM",
  //     "GARAGE",
  //     "BOATHOUSE",
  //     "CAR_SPACE"
  //   ],
  // }),
  numBedrooms: tinyint("numBedrooms"),
  numBathrooms: tinyint("numBathrooms"),
  squareMeters: int("squareMeters"),
  // coordinates: point("coordinates"),
  listedByUserId: int("listedByUserId"),
  status: varchar("status", {
    length: 20,
    enum: ["active", "inactive", "sold"],
  })
    .notNull()
    .default("inactive"),
});

export const propertyImages = mysqlTable("propertyImages", {
  id: serial("id").primaryKey(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  url: text("url").notNull(),
  propertyId: varchar("propertyId", { length: 12 }).notNull(),
});

export const propertyRelations = relations(properties, ({ one, many }) => ({
  propertyImages: many(propertyImages),
  listedBy: one(users, {
    fields: [properties.listedByUserId],
    references: [users.id],
  }),
  features: many(propertyFeatures),
  location: one(locations, {
    fields: [properties.locationId],
    references: [locations.id],
  }),
}));

export const propertyImageRelations = relations(propertyImages, ({ one }) => ({
  property: one(properties, {
    fields: [propertyImages.propertyId],
    references: [properties.publicId],
  }),
}));

export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  email: varchar("email", { length: 100 }).notNull().unique(),
  password: text("password").notNull(),
});

export const userRelations = relations(users, ({ many, one }) => ({
  listings: many(properties),
  profile: one(profiles, {
    fields: [users.id],
    references: [profiles.userId],
  }),
  agent: one(agents, {
    fields: [users.id],
    references: [agents.userId],
  }),
}));

export const featuresTable = mysqlTable("features", {
  id: varchar("id", { length: 50 }).unique().primaryKey(),
  name: varchar("name", { length: 50 }).notNull(),
});

export const propertyFeatures = mysqlTable(
  "propertyFeatures",
  {
    propertyId: varchar("propertyId", { length: 12 }).notNull(),
    featureId: varchar("featureId", { length: 50 }).notNull(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.propertyId, t.featureId] }),
  })
);

export const propertyToFeaturesRelations = relations(
  propertyFeatures,
  ({ one }) => ({
    property: one(properties, {
      fields: [propertyFeatures.propertyId],
      references: [properties.publicId],
    }),
    feature: one(featuresTable, {
      fields: [propertyFeatures.featureId],
      references: [featuresTable.id],
    }),
  })
);

export const locations = mysqlTable("locations", {
  id: varchar("id", { length: 50 }).unique().primaryKey(),
  name: varchar("name", { length: 50 }).notNull(),
  // center: point("center"),
  placeId: varchar("placeId", { length: 50 }),
});

export const profiles = mysqlTable("profiles", {
  id: serial("id").primaryKey(),
  userId: int("userId").unique().notNull(),
  firstName: varchar("firstName", { length: 50 }).notNull(),
  lastName: varchar("lastName", { length: 50 }).notNull(),
  phoneNumber: varchar("phoneNumber", { length: 50 }),
  profileImageUrl: text("profileImageUrl"),
});

export const agents = mysqlTable("agents", {
  id: serial("id").primaryKey(),
  userId: int("userId").unique().notNull(),
  agencyId: int("agencyId"),
  title: varchar("title", { length: 50 }),
});

export const agencies = mysqlTable("agencies", {
  id: serial("id").primaryKey(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  name: varchar("name", { length: 50 }).notNull(),
  logoUrl: text("logoUrl"),
});

export const agentsRelations = relations(agents, ({ one }) => ({
  user: one(users, {
    fields: [agents.userId],
    references: [users.id],
  }),
  agency: one(agencies, {
    fields: [agents.agencyId],
    references: [agencies.id],
  }),
}));

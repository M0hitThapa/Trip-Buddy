import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
 
  userTable: defineTable({
    name: v.string(),
    imageUrl:v.string(),
    email:v.string(),
    subscription:v.optional(v.string()),
  }),

  TripDetailTable:defineTable({
    tripId: v.string(),
    // Backward-compatible during migration: accept string (new) or object (old)
    tripDetail: v.union(v.string(), v.any()),
    uid: v.id('userTable')
  })
  
});
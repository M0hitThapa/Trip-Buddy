import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const CreateTripDetail=mutation({
    args:{
        tripId:v.string(),
        uid:v.id('userTable'),
        tripDetail:v.any()
    },
    handler:async(ctx, args) => {
        const stringified = JSON.stringify(args.tripDetail)
        const sizeInBytes = new TextEncoder().encode(stringified).length
        const sizeInMB = sizeInBytes / (1024 * 1024)
        
        console.log(`[CreateTrip] Saving trip with ${args.tripDetail?.itinerary?.length || 0} days`)
        console.log(`[CreateTrip] Data size: ${sizeInMB.toFixed(3)}MB (${sizeInBytes.toLocaleString()} bytes)`)
        console.log(`[CreateTrip] Itinerary days:`, args.tripDetail?.itinerary?.map((d: any) => d.day))
        
        if (sizeInMB > 0.9) {
          console.warn(`⚠️ Trip data is ${sizeInMB.toFixed(2)}MB, close to 1MB limit!`)
          throw new Error(`Trip data too large: ${sizeInMB.toFixed(2)}MB. Maximum is 1MB.`)
        }
        
        const result = await ctx.db.insert('TripDetailTable', {
            tripDetail: stringified,
            tripId: args.tripId,
            uid: args.uid
        })
        
        console.log(`[CreateTrip] ✅ Trip saved successfully with ID: ${result}`)
        return result
    }
})

export const ListTripsByUser = query({
  args: { uid: v.id('userTable') },
  handler: async (ctx, args) => {
    const trips = await ctx.db
      .query('TripDetailTable')
      .filter((q) => q.eq(q.field('uid'), args.uid))
      .order('desc')
      .collect()
    
    console.log(`[ListTrips] Found ${trips.length} trips for user`)
    
    // Parse tripDetail JSON back into an object for the client
    return trips.map((t, idx) => {
      let parsed: any = t.tripDetail
      if (typeof t.tripDetail === 'string') {
        try { 
          parsed = JSON.parse(t.tripDetail)
          console.log(`[ListTrips] Trip ${idx + 1}: ${parsed?.itinerary?.length || 0} days`)
        } catch (e) {
          console.error(`[ListTrips] Failed to parse trip ${idx + 1}:`, e)
        }
      }
      return { ...t, tripDetail: parsed }
    })
  }
})

export const GetTrip = query({
  args: { id: v.id('TripDetailTable') },
  handler: async (ctx, args) => {
    const doc = await ctx.db.get(args.id)
    if (!doc) return null
    
    console.log(`[GetTrip] Fetching trip ID: ${args.id}`)
    console.log(`[GetTrip] Raw tripDetail type:`, typeof doc.tripDetail)
    
    let parsed: any = doc.tripDetail
    if (typeof doc.tripDetail === 'string') {
      try { 
        parsed = JSON.parse(doc.tripDetail)
        console.log(`[GetTrip] Parsed itinerary length: ${parsed?.itinerary?.length || 0}`)
        console.log(`[GetTrip] Itinerary days:`, parsed?.itinerary?.map((d: any) => d.day))
      } catch (e) {
        console.error('[GetTrip] Failed to parse tripDetail:', e)
      }
    } else {
      console.log(`[GetTrip] tripDetail is already object, itinerary length: ${parsed?.itinerary?.length || 0}`)
    }
    
    return { ...doc, tripDetail: parsed }
  }
})

export const UpdateTripDetail = mutation({
  args: {
    id: v.id('TripDetailTable'),
    tripDetail: v.any(),
  },
  handler: async (ctx, args) => {
    const stringified = JSON.stringify(args.tripDetail)
    const sizeInBytes = new TextEncoder().encode(stringified).length
    const sizeInMB = sizeInBytes / (1024 * 1024)
    
    console.log(`Updating trip: ${args.tripDetail?.itinerary?.length || 0} days, ${sizeInMB.toFixed(2)}MB`)
    
    if (sizeInMB > 0.9) {
      console.warn(`Trip data is ${sizeInMB.toFixed(2)}MB, close to 1MB limit!`)
    }
    
    await ctx.db.patch(args.id, { tripDetail: stringified })
    return args.id
  }
})

export const DeleteTrip = mutation({
  args: { id: v.id('TripDetailTable') },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id)
    return args.id
  }
})
// This file is to dynamically generate TS types
// which we can't get using GenType
// Use @genType.import to link the types back to ReScript code

import type { Logger, EffectCaller } from "envio";
import type * as Entities from "./db/Entities.gen.ts";

export type LoaderContext = {
  /**
   * Access the logger instance with event as a context. The logs will be displayed in the console and Envio Hosted Service.
   */
  readonly log: Logger;
  /**
   * Call the provided Effect with the given input.
   * Effects are the best for external calls with automatic deduplication, error handling and caching.
   * Define a new Effect using createEffect outside of the handler.
   */
  readonly effect: EffectCaller;
  /**
   * True when the handlers run in preload mode - in parallel for the whole batch.
   * Handlers run twice per batch of events, and the first time is the "preload" run
   * During preload entities aren't set, logs are ignored and exceptions are silently swallowed.
   * Preload mode is the best time to populate data to in-memory cache.
   * After preload the handler will run for the second time in sequential order of events.
   */
  readonly isPreload: boolean;
  readonly GlobalStats: {
    /**
     * Load the entity GlobalStats from the storage by ID.
     * If the entity is not found, returns undefined.
     */
    readonly get: (id: string) => Promise<Entities.GlobalStats_t | undefined>,
    /**
     * Load the entity GlobalStats from the storage by ID.
     * If the entity is not found, throws an error.
     */
    readonly getOrThrow: (id: string, message?: string) => Promise<Entities.GlobalStats_t>,
    readonly getWhere: Entities.GlobalStats_indexedFieldOperations,
    /**
     * Returns the entity GlobalStats from the storage by ID.
     * If the entity is not found, creates it using provided parameters and returns it.
     */
    readonly getOrCreate: (entity: Entities.GlobalStats_t) => Promise<Entities.GlobalStats_t>,
    /**
     * Set the entity GlobalStats in the storage.
     */
    readonly set: (entity: Entities.GlobalStats_t) => void,
    /**
     * Delete the entity GlobalStats from the storage.
     *
     * The 'deleteUnsafe' method is experimental and unsafe. You should manually handle all entity references after deletion to maintain database consistency.
     */
    readonly deleteUnsafe: (id: string) => void,
  }
  readonly Order: {
    /**
     * Load the entity Order from the storage by ID.
     * If the entity is not found, returns undefined.
     */
    readonly get: (id: string) => Promise<Entities.Order_t | undefined>,
    /**
     * Load the entity Order from the storage by ID.
     * If the entity is not found, throws an error.
     */
    readonly getOrThrow: (id: string, message?: string) => Promise<Entities.Order_t>,
    readonly getWhere: Entities.Order_indexedFieldOperations,
    /**
     * Returns the entity Order from the storage by ID.
     * If the entity is not found, creates it using provided parameters and returns it.
     */
    readonly getOrCreate: (entity: Entities.Order_t) => Promise<Entities.Order_t>,
    /**
     * Set the entity Order in the storage.
     */
    readonly set: (entity: Entities.Order_t) => void,
    /**
     * Delete the entity Order from the storage.
     *
     * The 'deleteUnsafe' method is experimental and unsafe. You should manually handle all entity references after deletion to maintain database consistency.
     */
    readonly deleteUnsafe: (id: string) => void,
  }
  readonly OrderEvent: {
    /**
     * Load the entity OrderEvent from the storage by ID.
     * If the entity is not found, returns undefined.
     */
    readonly get: (id: string) => Promise<Entities.OrderEvent_t | undefined>,
    /**
     * Load the entity OrderEvent from the storage by ID.
     * If the entity is not found, throws an error.
     */
    readonly getOrThrow: (id: string, message?: string) => Promise<Entities.OrderEvent_t>,
    readonly getWhere: Entities.OrderEvent_indexedFieldOperations,
    /**
     * Returns the entity OrderEvent from the storage by ID.
     * If the entity is not found, creates it using provided parameters and returns it.
     */
    readonly getOrCreate: (entity: Entities.OrderEvent_t) => Promise<Entities.OrderEvent_t>,
    /**
     * Set the entity OrderEvent in the storage.
     */
    readonly set: (entity: Entities.OrderEvent_t) => void,
    /**
     * Delete the entity OrderEvent from the storage.
     *
     * The 'deleteUnsafe' method is experimental and unsafe. You should manually handle all entity references after deletion to maintain database consistency.
     */
    readonly deleteUnsafe: (id: string) => void,
  }
};

export type HandlerContext = {
  /**
   * Access the logger instance with event as a context. The logs will be displayed in the console and Envio Hosted Service.
   */
  readonly log: Logger;
  /**
   * Call the provided Effect with the given input.
   * Effects are the best for external calls with automatic deduplication, error handling and caching.
   * Define a new Effect using createEffect outside of the handler.
   */
  readonly effect: EffectCaller;
  readonly GlobalStats: {
    /**
     * Load the entity GlobalStats from the storage by ID.
     * If the entity is not found, returns undefined.
     */
    readonly get: (id: string) => Promise<Entities.GlobalStats_t | undefined>,
    /**
     * Load the entity GlobalStats from the storage by ID.
     * If the entity is not found, throws an error.
     */
    readonly getOrThrow: (id: string, message?: string) => Promise<Entities.GlobalStats_t>,
    /**
     * Returns the entity GlobalStats from the storage by ID.
     * If the entity is not found, creates it using provided parameters and returns it.
     */
    readonly getOrCreate: (entity: Entities.GlobalStats_t) => Promise<Entities.GlobalStats_t>,
    /**
     * Set the entity GlobalStats in the storage.
     */
    readonly set: (entity: Entities.GlobalStats_t) => void,
    /**
     * Delete the entity GlobalStats from the storage.
     *
     * The 'deleteUnsafe' method is experimental and unsafe. You should manually handle all entity references after deletion to maintain database consistency.
     */
    readonly deleteUnsafe: (id: string) => void,
  }
  readonly Order: {
    /**
     * Load the entity Order from the storage by ID.
     * If the entity is not found, returns undefined.
     */
    readonly get: (id: string) => Promise<Entities.Order_t | undefined>,
    /**
     * Load the entity Order from the storage by ID.
     * If the entity is not found, throws an error.
     */
    readonly getOrThrow: (id: string, message?: string) => Promise<Entities.Order_t>,
    /**
     * Returns the entity Order from the storage by ID.
     * If the entity is not found, creates it using provided parameters and returns it.
     */
    readonly getOrCreate: (entity: Entities.Order_t) => Promise<Entities.Order_t>,
    /**
     * Set the entity Order in the storage.
     */
    readonly set: (entity: Entities.Order_t) => void,
    /**
     * Delete the entity Order from the storage.
     *
     * The 'deleteUnsafe' method is experimental and unsafe. You should manually handle all entity references after deletion to maintain database consistency.
     */
    readonly deleteUnsafe: (id: string) => void,
  }
  readonly OrderEvent: {
    /**
     * Load the entity OrderEvent from the storage by ID.
     * If the entity is not found, returns undefined.
     */
    readonly get: (id: string) => Promise<Entities.OrderEvent_t | undefined>,
    /**
     * Load the entity OrderEvent from the storage by ID.
     * If the entity is not found, throws an error.
     */
    readonly getOrThrow: (id: string, message?: string) => Promise<Entities.OrderEvent_t>,
    /**
     * Returns the entity OrderEvent from the storage by ID.
     * If the entity is not found, creates it using provided parameters and returns it.
     */
    readonly getOrCreate: (entity: Entities.OrderEvent_t) => Promise<Entities.OrderEvent_t>,
    /**
     * Set the entity OrderEvent in the storage.
     */
    readonly set: (entity: Entities.OrderEvent_t) => void,
    /**
     * Delete the entity OrderEvent from the storage.
     *
     * The 'deleteUnsafe' method is experimental and unsafe. You should manually handle all entity references after deletion to maintain database consistency.
     */
    readonly deleteUnsafe: (id: string) => void,
  }
};

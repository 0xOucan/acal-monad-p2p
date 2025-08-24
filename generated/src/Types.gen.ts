/* TypeScript file generated from Types.res by genType. */

/* eslint-disable */
/* tslint:disable */

import type {GlobalStats_t as Entities_GlobalStats_t} from '../src/db/Entities.gen';

import type {HandlerContext as $$handlerContext} from './Types.ts';

import type {HandlerWithOptions as $$fnWithEventConfig} from './bindings/OpaqueTypes.ts';

import type {LoaderContext as $$loaderContext} from './Types.ts';

import type {OrderEvent_t as Entities_OrderEvent_t} from '../src/db/Entities.gen';

import type {Order_t as Entities_Order_t} from '../src/db/Entities.gen';

import type {SingleOrMultiple as $$SingleOrMultiple_t} from './bindings/OpaqueTypes';

import type {entityHandlerContext as Internal_entityHandlerContext} from 'envio/src/Internal.gen';

import type {eventOptions as Internal_eventOptions} from 'envio/src/Internal.gen';

import type {genericContractRegisterArgs as Internal_genericContractRegisterArgs} from 'envio/src/Internal.gen';

import type {genericContractRegister as Internal_genericContractRegister} from 'envio/src/Internal.gen';

import type {genericEvent as Internal_genericEvent} from 'envio/src/Internal.gen';

import type {genericHandlerArgs as Internal_genericHandlerArgs} from 'envio/src/Internal.gen';

import type {genericHandlerWithLoader as Internal_genericHandlerWithLoader} from 'envio/src/Internal.gen';

import type {genericHandler as Internal_genericHandler} from 'envio/src/Internal.gen';

import type {genericLoaderArgs as Internal_genericLoaderArgs} from 'envio/src/Internal.gen';

import type {genericLoader as Internal_genericLoader} from 'envio/src/Internal.gen';

import type {logger as Envio_logger} from 'envio/src/Envio.gen';

import type {t as Address_t} from 'envio/src/Address.gen';

export type id = string;
export type Id = id;

export type contractRegistrations = { readonly log: Envio_logger; readonly addAcalEscrow: (_1:Address_t) => void };

export type entityLoaderContext<entity,indexedFieldOperations> = {
  readonly get: (_1:id) => Promise<(undefined | entity)>; 
  readonly getOrThrow: (_1:id, message:(undefined | string)) => Promise<entity>; 
  readonly getWhere: indexedFieldOperations; 
  readonly getOrCreate: (_1:entity) => Promise<entity>; 
  readonly set: (_1:entity) => void; 
  readonly deleteUnsafe: (_1:id) => void
};

export type loaderContext = $$loaderContext;

export type entityHandlerContext<entity> = Internal_entityHandlerContext<entity>;

export type handlerContext = $$handlerContext;

export type globalStats = Entities_GlobalStats_t;
export type GlobalStats = globalStats;

export type order = Entities_Order_t;
export type Order = order;

export type orderEvent = Entities_OrderEvent_t;
export type OrderEvent = orderEvent;

export type eventIdentifier = {
  readonly chainId: number; 
  readonly blockTimestamp: number; 
  readonly blockNumber: number; 
  readonly logIndex: number
};

export type entityUpdateAction<entityType> = "Delete" | { TAG: "Set"; _0: entityType };

export type entityUpdate<entityType> = {
  readonly eventIdentifier: eventIdentifier; 
  readonly entityId: id; 
  readonly entityUpdateAction: entityUpdateAction<entityType>
};

export type entityValueAtStartOfBatch<entityType> = 
    "NotSet"
  | { TAG: "AlreadySet"; _0: entityType };

export type updatedValue<entityType> = {
  readonly latest: entityUpdate<entityType>; 
  readonly history: entityUpdate<entityType>[]; 
  readonly containsRollbackDiffChange: boolean
};

export type inMemoryStoreRowEntity<entityType> = 
    { TAG: "Updated"; _0: updatedValue<entityType> }
  | { TAG: "InitialReadFromDb"; _0: entityValueAtStartOfBatch<entityType> };

export type Transaction_t = {
  readonly hash: string; 
  readonly transactionIndex: number; 
  readonly gasUsed: bigint; 
  readonly gasPrice: (undefined | bigint)
};

export type Block_t = {
  readonly number: number; 
  readonly timestamp: number; 
  readonly hash: string
};

export type AggregatedBlock_t = {
  readonly hash: string; 
  readonly number: number; 
  readonly timestamp: number
};

export type AggregatedTransaction_t = {
  readonly gasPrice: (undefined | bigint); 
  readonly gasUsed: bigint; 
  readonly hash: string; 
  readonly transactionIndex: number
};

export type eventLog<params> = Internal_genericEvent<params,Block_t,Transaction_t>;
export type EventLog<params> = eventLog<params>;

export type SingleOrMultiple_t<a> = $$SingleOrMultiple_t<a>;

export type HandlerTypes_args<eventArgs,context> = { readonly event: eventLog<eventArgs>; readonly context: context };

export type HandlerTypes_contractRegisterArgs<eventArgs> = Internal_genericContractRegisterArgs<eventLog<eventArgs>,contractRegistrations>;

export type HandlerTypes_contractRegister<eventArgs> = Internal_genericContractRegister<HandlerTypes_contractRegisterArgs<eventArgs>>;

export type HandlerTypes_loaderArgs<eventArgs> = Internal_genericLoaderArgs<eventLog<eventArgs>,loaderContext>;

export type HandlerTypes_loader<eventArgs,loaderReturn> = Internal_genericLoader<HandlerTypes_loaderArgs<eventArgs>,loaderReturn>;

export type HandlerTypes_handlerArgs<eventArgs,loaderReturn> = Internal_genericHandlerArgs<eventLog<eventArgs>,handlerContext,loaderReturn>;

export type HandlerTypes_handler<eventArgs,loaderReturn> = Internal_genericHandler<HandlerTypes_handlerArgs<eventArgs,loaderReturn>>;

export type HandlerTypes_loaderHandler<eventArgs,loaderReturn,eventFilters> = Internal_genericHandlerWithLoader<HandlerTypes_loader<eventArgs,loaderReturn>,HandlerTypes_handler<eventArgs,loaderReturn>,eventFilters>;

export type HandlerTypes_eventConfig<eventFilters> = Internal_eventOptions<eventFilters>;

export type fnWithEventConfig<fn,eventConfig> = $$fnWithEventConfig<fn,eventConfig>;

export type handlerWithOptions<eventArgs,loaderReturn,eventFilters> = fnWithEventConfig<HandlerTypes_handler<eventArgs,loaderReturn>,HandlerTypes_eventConfig<eventFilters>>;

export type contractRegisterWithOptions<eventArgs,eventFilters> = fnWithEventConfig<HandlerTypes_contractRegister<eventArgs>,HandlerTypes_eventConfig<eventFilters>>;

export type AcalEscrow_chainId = 10143;

export type AcalEscrow_OrderCreated_eventArgs = {
  readonly id: bigint; 
  readonly maker: Address_t; 
  readonly mxn: bigint; 
  readonly mon: bigint; 
  readonly expiry: bigint
};

export type AcalEscrow_OrderCreated_block = Block_t;

export type AcalEscrow_OrderCreated_transaction = Transaction_t;

export type AcalEscrow_OrderCreated_event = {
  /** The parameters or arguments associated with this event. */
  readonly params: AcalEscrow_OrderCreated_eventArgs; 
  /** The unique identifier of the blockchain network where this event occurred. */
  readonly chainId: AcalEscrow_chainId; 
  /** The address of the contract that emitted this event. */
  readonly srcAddress: Address_t; 
  /** The index of this event's log within the block. */
  readonly logIndex: number; 
  /** The transaction that triggered this event. Configurable in `config.yaml` via the `field_selection` option. */
  readonly transaction: AcalEscrow_OrderCreated_transaction; 
  /** The block in which this event was recorded. Configurable in `config.yaml` via the `field_selection` option. */
  readonly block: AcalEscrow_OrderCreated_block
};

export type AcalEscrow_OrderCreated_loaderArgs = Internal_genericLoaderArgs<AcalEscrow_OrderCreated_event,loaderContext>;

export type AcalEscrow_OrderCreated_loader<loaderReturn> = Internal_genericLoader<AcalEscrow_OrderCreated_loaderArgs,loaderReturn>;

export type AcalEscrow_OrderCreated_handlerArgs<loaderReturn> = Internal_genericHandlerArgs<AcalEscrow_OrderCreated_event,handlerContext,loaderReturn>;

export type AcalEscrow_OrderCreated_handler<loaderReturn> = Internal_genericHandler<AcalEscrow_OrderCreated_handlerArgs<loaderReturn>>;

export type AcalEscrow_OrderCreated_contractRegister = Internal_genericContractRegister<Internal_genericContractRegisterArgs<AcalEscrow_OrderCreated_event,contractRegistrations>>;

export type AcalEscrow_OrderCreated_eventFilter = { readonly id?: SingleOrMultiple_t<bigint>; readonly maker?: SingleOrMultiple_t<Address_t> };

export type AcalEscrow_OrderCreated_eventFiltersArgs = { 
/** The unique identifier of the blockchain network where this event occurred. */
readonly chainId: AcalEscrow_chainId; 
/** Addresses of the contracts indexing the event. */
readonly addresses: Address_t[] };

export type AcalEscrow_OrderCreated_eventFiltersDefinition = 
    AcalEscrow_OrderCreated_eventFilter
  | AcalEscrow_OrderCreated_eventFilter[];

export type AcalEscrow_OrderCreated_eventFilters = 
    AcalEscrow_OrderCreated_eventFilter
  | AcalEscrow_OrderCreated_eventFilter[]
  | ((_1:AcalEscrow_OrderCreated_eventFiltersArgs) => AcalEscrow_OrderCreated_eventFiltersDefinition);

export type AcalEscrow_OrderLocked_eventArgs = {
  readonly id: bigint; 
  readonly taker: Address_t; 
  readonly value: bigint
};

export type AcalEscrow_OrderLocked_block = Block_t;

export type AcalEscrow_OrderLocked_transaction = Transaction_t;

export type AcalEscrow_OrderLocked_event = {
  /** The parameters or arguments associated with this event. */
  readonly params: AcalEscrow_OrderLocked_eventArgs; 
  /** The unique identifier of the blockchain network where this event occurred. */
  readonly chainId: AcalEscrow_chainId; 
  /** The address of the contract that emitted this event. */
  readonly srcAddress: Address_t; 
  /** The index of this event's log within the block. */
  readonly logIndex: number; 
  /** The transaction that triggered this event. Configurable in `config.yaml` via the `field_selection` option. */
  readonly transaction: AcalEscrow_OrderLocked_transaction; 
  /** The block in which this event was recorded. Configurable in `config.yaml` via the `field_selection` option. */
  readonly block: AcalEscrow_OrderLocked_block
};

export type AcalEscrow_OrderLocked_loaderArgs = Internal_genericLoaderArgs<AcalEscrow_OrderLocked_event,loaderContext>;

export type AcalEscrow_OrderLocked_loader<loaderReturn> = Internal_genericLoader<AcalEscrow_OrderLocked_loaderArgs,loaderReturn>;

export type AcalEscrow_OrderLocked_handlerArgs<loaderReturn> = Internal_genericHandlerArgs<AcalEscrow_OrderLocked_event,handlerContext,loaderReturn>;

export type AcalEscrow_OrderLocked_handler<loaderReturn> = Internal_genericHandler<AcalEscrow_OrderLocked_handlerArgs<loaderReturn>>;

export type AcalEscrow_OrderLocked_contractRegister = Internal_genericContractRegister<Internal_genericContractRegisterArgs<AcalEscrow_OrderLocked_event,contractRegistrations>>;

export type AcalEscrow_OrderLocked_eventFilter = { readonly id?: SingleOrMultiple_t<bigint>; readonly taker?: SingleOrMultiple_t<Address_t> };

export type AcalEscrow_OrderLocked_eventFiltersArgs = { 
/** The unique identifier of the blockchain network where this event occurred. */
readonly chainId: AcalEscrow_chainId; 
/** Addresses of the contracts indexing the event. */
readonly addresses: Address_t[] };

export type AcalEscrow_OrderLocked_eventFiltersDefinition = 
    AcalEscrow_OrderLocked_eventFilter
  | AcalEscrow_OrderLocked_eventFilter[];

export type AcalEscrow_OrderLocked_eventFilters = 
    AcalEscrow_OrderLocked_eventFilter
  | AcalEscrow_OrderLocked_eventFilter[]
  | ((_1:AcalEscrow_OrderLocked_eventFiltersArgs) => AcalEscrow_OrderLocked_eventFiltersDefinition);

export type AcalEscrow_OrderCompleted_eventArgs = { readonly id: bigint };

export type AcalEscrow_OrderCompleted_block = Block_t;

export type AcalEscrow_OrderCompleted_transaction = Transaction_t;

export type AcalEscrow_OrderCompleted_event = {
  /** The parameters or arguments associated with this event. */
  readonly params: AcalEscrow_OrderCompleted_eventArgs; 
  /** The unique identifier of the blockchain network where this event occurred. */
  readonly chainId: AcalEscrow_chainId; 
  /** The address of the contract that emitted this event. */
  readonly srcAddress: Address_t; 
  /** The index of this event's log within the block. */
  readonly logIndex: number; 
  /** The transaction that triggered this event. Configurable in `config.yaml` via the `field_selection` option. */
  readonly transaction: AcalEscrow_OrderCompleted_transaction; 
  /** The block in which this event was recorded. Configurable in `config.yaml` via the `field_selection` option. */
  readonly block: AcalEscrow_OrderCompleted_block
};

export type AcalEscrow_OrderCompleted_loaderArgs = Internal_genericLoaderArgs<AcalEscrow_OrderCompleted_event,loaderContext>;

export type AcalEscrow_OrderCompleted_loader<loaderReturn> = Internal_genericLoader<AcalEscrow_OrderCompleted_loaderArgs,loaderReturn>;

export type AcalEscrow_OrderCompleted_handlerArgs<loaderReturn> = Internal_genericHandlerArgs<AcalEscrow_OrderCompleted_event,handlerContext,loaderReturn>;

export type AcalEscrow_OrderCompleted_handler<loaderReturn> = Internal_genericHandler<AcalEscrow_OrderCompleted_handlerArgs<loaderReturn>>;

export type AcalEscrow_OrderCompleted_contractRegister = Internal_genericContractRegister<Internal_genericContractRegisterArgs<AcalEscrow_OrderCompleted_event,contractRegistrations>>;

export type AcalEscrow_OrderCompleted_eventFilter = { readonly id?: SingleOrMultiple_t<bigint> };

export type AcalEscrow_OrderCompleted_eventFiltersArgs = { 
/** The unique identifier of the blockchain network where this event occurred. */
readonly chainId: AcalEscrow_chainId; 
/** Addresses of the contracts indexing the event. */
readonly addresses: Address_t[] };

export type AcalEscrow_OrderCompleted_eventFiltersDefinition = 
    AcalEscrow_OrderCompleted_eventFilter
  | AcalEscrow_OrderCompleted_eventFilter[];

export type AcalEscrow_OrderCompleted_eventFilters = 
    AcalEscrow_OrderCompleted_eventFilter
  | AcalEscrow_OrderCompleted_eventFilter[]
  | ((_1:AcalEscrow_OrderCompleted_eventFiltersArgs) => AcalEscrow_OrderCompleted_eventFiltersDefinition);

export type chainId = number;

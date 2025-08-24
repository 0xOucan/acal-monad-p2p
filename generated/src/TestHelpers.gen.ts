/* TypeScript file generated from TestHelpers.res by genType. */

/* eslint-disable */
/* tslint:disable */

const TestHelpersJS = require('./TestHelpers.res.js');

import type {AcalEscrow_OrderCancelled_event as Types_AcalEscrow_OrderCancelled_event} from './Types.gen';

import type {AcalEscrow_OrderCompleted_event as Types_AcalEscrow_OrderCompleted_event} from './Types.gen';

import type {AcalEscrow_OrderCreated_event as Types_AcalEscrow_OrderCreated_event} from './Types.gen';

import type {AcalEscrow_OrderDisputed_event as Types_AcalEscrow_OrderDisputed_event} from './Types.gen';

import type {AcalEscrow_OrderLocked_event as Types_AcalEscrow_OrderLocked_event} from './Types.gen';

import type {t as Address_t} from 'envio/src/Address.gen';

import type {t as TestHelpers_MockDb_t} from './TestHelpers_MockDb.gen';

/** The arguements that get passed to a "processEvent" helper function */
export type EventFunctions_eventProcessorArgs<event> = {
  readonly event: event; 
  readonly mockDb: TestHelpers_MockDb_t; 
  readonly chainId?: number
};

export type EventFunctions_eventProcessor<event> = (_1:EventFunctions_eventProcessorArgs<event>) => Promise<TestHelpers_MockDb_t>;

export type EventFunctions_MockBlock_t = {
  readonly hash?: string; 
  readonly number?: number; 
  readonly timestamp?: number
};

export type EventFunctions_MockTransaction_t = {
  readonly gasPrice?: (undefined | bigint); 
  readonly gasUsed?: bigint; 
  readonly hash?: string; 
  readonly transactionIndex?: number
};

export type EventFunctions_mockEventData = {
  readonly chainId?: number; 
  readonly srcAddress?: Address_t; 
  readonly logIndex?: number; 
  readonly block?: EventFunctions_MockBlock_t; 
  readonly transaction?: EventFunctions_MockTransaction_t
};

export type AcalEscrow_OrderCreated_createMockArgs = {
  readonly orderId?: bigint; 
  readonly maker?: Address_t; 
  readonly crHash?: string; 
  readonly hashQR?: string; 
  readonly mxn?: bigint; 
  readonly mon?: bigint; 
  readonly expiry?: bigint; 
  readonly mockEventData?: EventFunctions_mockEventData
};

export type AcalEscrow_OrderLocked_createMockArgs = {
  readonly orderId?: bigint; 
  readonly taker?: Address_t; 
  readonly mockEventData?: EventFunctions_mockEventData
};

export type AcalEscrow_OrderCompleted_createMockArgs = { readonly orderId?: bigint; readonly mockEventData?: EventFunctions_mockEventData };

export type AcalEscrow_OrderCancelled_createMockArgs = { readonly orderId?: bigint; readonly mockEventData?: EventFunctions_mockEventData };

export type AcalEscrow_OrderDisputed_createMockArgs = { readonly orderId?: bigint; readonly mockEventData?: EventFunctions_mockEventData };

export const MockDb_createMockDb: () => TestHelpers_MockDb_t = TestHelpersJS.MockDb.createMockDb as any;

export const Addresses_mockAddresses: Address_t[] = TestHelpersJS.Addresses.mockAddresses as any;

export const Addresses_defaultAddress: Address_t = TestHelpersJS.Addresses.defaultAddress as any;

export const AcalEscrow_OrderCreated_processEvent: EventFunctions_eventProcessor<Types_AcalEscrow_OrderCreated_event> = TestHelpersJS.AcalEscrow.OrderCreated.processEvent as any;

export const AcalEscrow_OrderCreated_createMockEvent: (args:AcalEscrow_OrderCreated_createMockArgs) => Types_AcalEscrow_OrderCreated_event = TestHelpersJS.AcalEscrow.OrderCreated.createMockEvent as any;

export const AcalEscrow_OrderLocked_processEvent: EventFunctions_eventProcessor<Types_AcalEscrow_OrderLocked_event> = TestHelpersJS.AcalEscrow.OrderLocked.processEvent as any;

export const AcalEscrow_OrderLocked_createMockEvent: (args:AcalEscrow_OrderLocked_createMockArgs) => Types_AcalEscrow_OrderLocked_event = TestHelpersJS.AcalEscrow.OrderLocked.createMockEvent as any;

export const AcalEscrow_OrderCompleted_processEvent: EventFunctions_eventProcessor<Types_AcalEscrow_OrderCompleted_event> = TestHelpersJS.AcalEscrow.OrderCompleted.processEvent as any;

export const AcalEscrow_OrderCompleted_createMockEvent: (args:AcalEscrow_OrderCompleted_createMockArgs) => Types_AcalEscrow_OrderCompleted_event = TestHelpersJS.AcalEscrow.OrderCompleted.createMockEvent as any;

export const AcalEscrow_OrderCancelled_processEvent: EventFunctions_eventProcessor<Types_AcalEscrow_OrderCancelled_event> = TestHelpersJS.AcalEscrow.OrderCancelled.processEvent as any;

export const AcalEscrow_OrderCancelled_createMockEvent: (args:AcalEscrow_OrderCancelled_createMockArgs) => Types_AcalEscrow_OrderCancelled_event = TestHelpersJS.AcalEscrow.OrderCancelled.createMockEvent as any;

export const AcalEscrow_OrderDisputed_processEvent: EventFunctions_eventProcessor<Types_AcalEscrow_OrderDisputed_event> = TestHelpersJS.AcalEscrow.OrderDisputed.processEvent as any;

export const AcalEscrow_OrderDisputed_createMockEvent: (args:AcalEscrow_OrderDisputed_createMockArgs) => Types_AcalEscrow_OrderDisputed_event = TestHelpersJS.AcalEscrow.OrderDisputed.createMockEvent as any;

export const Addresses: { mockAddresses: Address_t[]; defaultAddress: Address_t } = TestHelpersJS.Addresses as any;

export const AcalEscrow: {
  OrderCreated: {
    processEvent: EventFunctions_eventProcessor<Types_AcalEscrow_OrderCreated_event>; 
    createMockEvent: (args:AcalEscrow_OrderCreated_createMockArgs) => Types_AcalEscrow_OrderCreated_event
  }; 
  OrderCompleted: {
    processEvent: EventFunctions_eventProcessor<Types_AcalEscrow_OrderCompleted_event>; 
    createMockEvent: (args:AcalEscrow_OrderCompleted_createMockArgs) => Types_AcalEscrow_OrderCompleted_event
  }; 
  OrderCancelled: {
    processEvent: EventFunctions_eventProcessor<Types_AcalEscrow_OrderCancelled_event>; 
    createMockEvent: (args:AcalEscrow_OrderCancelled_createMockArgs) => Types_AcalEscrow_OrderCancelled_event
  }; 
  OrderLocked: {
    processEvent: EventFunctions_eventProcessor<Types_AcalEscrow_OrderLocked_event>; 
    createMockEvent: (args:AcalEscrow_OrderLocked_createMockArgs) => Types_AcalEscrow_OrderLocked_event
  }; 
  OrderDisputed: {
    processEvent: EventFunctions_eventProcessor<Types_AcalEscrow_OrderDisputed_event>; 
    createMockEvent: (args:AcalEscrow_OrderDisputed_createMockArgs) => Types_AcalEscrow_OrderDisputed_event
  }
} = TestHelpersJS.AcalEscrow as any;

export const MockDb: { createMockDb: () => TestHelpers_MockDb_t } = TestHelpersJS.MockDb as any;

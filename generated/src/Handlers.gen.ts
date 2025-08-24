/* TypeScript file generated from Handlers.res by genType. */

/* eslint-disable */
/* tslint:disable */

const HandlersJS = require('./Handlers.res.js');

import type {AcalEscrow_OrderCompleted_eventFilters as Types_AcalEscrow_OrderCompleted_eventFilters} from './Types.gen';

import type {AcalEscrow_OrderCompleted_event as Types_AcalEscrow_OrderCompleted_event} from './Types.gen';

import type {AcalEscrow_OrderCreated_eventFilters as Types_AcalEscrow_OrderCreated_eventFilters} from './Types.gen';

import type {AcalEscrow_OrderCreated_event as Types_AcalEscrow_OrderCreated_event} from './Types.gen';

import type {AcalEscrow_OrderLocked_eventFilters as Types_AcalEscrow_OrderLocked_eventFilters} from './Types.gen';

import type {AcalEscrow_OrderLocked_event as Types_AcalEscrow_OrderLocked_event} from './Types.gen';

import type {HandlerTypes_eventConfig as Types_HandlerTypes_eventConfig} from './Types.gen';

import type {contractRegistrations as Types_contractRegistrations} from './Types.gen';

import type {fnWithEventConfig as Types_fnWithEventConfig} from './Types.gen';

import type {genericContractRegisterArgs as Internal_genericContractRegisterArgs} from 'envio/src/Internal.gen';

import type {genericContractRegister as Internal_genericContractRegister} from 'envio/src/Internal.gen';

import type {genericHandlerArgs as Internal_genericHandlerArgs} from 'envio/src/Internal.gen';

import type {genericHandlerWithLoader as Internal_genericHandlerWithLoader} from 'envio/src/Internal.gen';

import type {genericHandler as Internal_genericHandler} from 'envio/src/Internal.gen';

import type {genericLoaderArgs as Internal_genericLoaderArgs} from 'envio/src/Internal.gen';

import type {genericLoader as Internal_genericLoader} from 'envio/src/Internal.gen';

import type {handlerContext as Types_handlerContext} from './Types.gen';

import type {loaderContext as Types_loaderContext} from './Types.gen';

export const AcalEscrow_OrderCreated_contractRegister: Types_fnWithEventConfig<Internal_genericContractRegister<Internal_genericContractRegisterArgs<Types_AcalEscrow_OrderCreated_event,Types_contractRegistrations>>,Types_HandlerTypes_eventConfig<Types_AcalEscrow_OrderCreated_eventFilters>> = HandlersJS.AcalEscrow.OrderCreated.contractRegister as any;

export const AcalEscrow_OrderCreated_handler: Types_fnWithEventConfig<Internal_genericHandler<Internal_genericHandlerArgs<Types_AcalEscrow_OrderCreated_event,Types_handlerContext,void>>,Types_HandlerTypes_eventConfig<Types_AcalEscrow_OrderCreated_eventFilters>> = HandlersJS.AcalEscrow.OrderCreated.handler as any;

export const AcalEscrow_OrderCreated_handlerWithLoader: <loaderReturn>(_1:Internal_genericHandlerWithLoader<Internal_genericLoader<Internal_genericLoaderArgs<Types_AcalEscrow_OrderCreated_event,Types_loaderContext>,loaderReturn>,Internal_genericHandler<Internal_genericHandlerArgs<Types_AcalEscrow_OrderCreated_event,Types_handlerContext,loaderReturn>>,Types_AcalEscrow_OrderCreated_eventFilters>) => void = HandlersJS.AcalEscrow.OrderCreated.handlerWithLoader as any;

export const AcalEscrow_OrderLocked_contractRegister: Types_fnWithEventConfig<Internal_genericContractRegister<Internal_genericContractRegisterArgs<Types_AcalEscrow_OrderLocked_event,Types_contractRegistrations>>,Types_HandlerTypes_eventConfig<Types_AcalEscrow_OrderLocked_eventFilters>> = HandlersJS.AcalEscrow.OrderLocked.contractRegister as any;

export const AcalEscrow_OrderLocked_handler: Types_fnWithEventConfig<Internal_genericHandler<Internal_genericHandlerArgs<Types_AcalEscrow_OrderLocked_event,Types_handlerContext,void>>,Types_HandlerTypes_eventConfig<Types_AcalEscrow_OrderLocked_eventFilters>> = HandlersJS.AcalEscrow.OrderLocked.handler as any;

export const AcalEscrow_OrderLocked_handlerWithLoader: <loaderReturn>(_1:Internal_genericHandlerWithLoader<Internal_genericLoader<Internal_genericLoaderArgs<Types_AcalEscrow_OrderLocked_event,Types_loaderContext>,loaderReturn>,Internal_genericHandler<Internal_genericHandlerArgs<Types_AcalEscrow_OrderLocked_event,Types_handlerContext,loaderReturn>>,Types_AcalEscrow_OrderLocked_eventFilters>) => void = HandlersJS.AcalEscrow.OrderLocked.handlerWithLoader as any;

export const AcalEscrow_OrderCompleted_contractRegister: Types_fnWithEventConfig<Internal_genericContractRegister<Internal_genericContractRegisterArgs<Types_AcalEscrow_OrderCompleted_event,Types_contractRegistrations>>,Types_HandlerTypes_eventConfig<Types_AcalEscrow_OrderCompleted_eventFilters>> = HandlersJS.AcalEscrow.OrderCompleted.contractRegister as any;

export const AcalEscrow_OrderCompleted_handler: Types_fnWithEventConfig<Internal_genericHandler<Internal_genericHandlerArgs<Types_AcalEscrow_OrderCompleted_event,Types_handlerContext,void>>,Types_HandlerTypes_eventConfig<Types_AcalEscrow_OrderCompleted_eventFilters>> = HandlersJS.AcalEscrow.OrderCompleted.handler as any;

export const AcalEscrow_OrderCompleted_handlerWithLoader: <loaderReturn>(_1:Internal_genericHandlerWithLoader<Internal_genericLoader<Internal_genericLoaderArgs<Types_AcalEscrow_OrderCompleted_event,Types_loaderContext>,loaderReturn>,Internal_genericHandler<Internal_genericHandlerArgs<Types_AcalEscrow_OrderCompleted_event,Types_handlerContext,loaderReturn>>,Types_AcalEscrow_OrderCompleted_eventFilters>) => void = HandlersJS.AcalEscrow.OrderCompleted.handlerWithLoader as any;

export const AcalEscrow: {
  OrderCreated: {
    handlerWithLoader: <loaderReturn>(_1:Internal_genericHandlerWithLoader<Internal_genericLoader<Internal_genericLoaderArgs<Types_AcalEscrow_OrderCreated_event,Types_loaderContext>,loaderReturn>,Internal_genericHandler<Internal_genericHandlerArgs<Types_AcalEscrow_OrderCreated_event,Types_handlerContext,loaderReturn>>,Types_AcalEscrow_OrderCreated_eventFilters>) => void; 
    handler: Types_fnWithEventConfig<Internal_genericHandler<Internal_genericHandlerArgs<Types_AcalEscrow_OrderCreated_event,Types_handlerContext,void>>,Types_HandlerTypes_eventConfig<Types_AcalEscrow_OrderCreated_eventFilters>>; 
    contractRegister: Types_fnWithEventConfig<Internal_genericContractRegister<Internal_genericContractRegisterArgs<Types_AcalEscrow_OrderCreated_event,Types_contractRegistrations>>,Types_HandlerTypes_eventConfig<Types_AcalEscrow_OrderCreated_eventFilters>>
  }; 
  OrderCompleted: {
    handlerWithLoader: <loaderReturn>(_1:Internal_genericHandlerWithLoader<Internal_genericLoader<Internal_genericLoaderArgs<Types_AcalEscrow_OrderCompleted_event,Types_loaderContext>,loaderReturn>,Internal_genericHandler<Internal_genericHandlerArgs<Types_AcalEscrow_OrderCompleted_event,Types_handlerContext,loaderReturn>>,Types_AcalEscrow_OrderCompleted_eventFilters>) => void; 
    handler: Types_fnWithEventConfig<Internal_genericHandler<Internal_genericHandlerArgs<Types_AcalEscrow_OrderCompleted_event,Types_handlerContext,void>>,Types_HandlerTypes_eventConfig<Types_AcalEscrow_OrderCompleted_eventFilters>>; 
    contractRegister: Types_fnWithEventConfig<Internal_genericContractRegister<Internal_genericContractRegisterArgs<Types_AcalEscrow_OrderCompleted_event,Types_contractRegistrations>>,Types_HandlerTypes_eventConfig<Types_AcalEscrow_OrderCompleted_eventFilters>>
  }; 
  OrderLocked: {
    handlerWithLoader: <loaderReturn>(_1:Internal_genericHandlerWithLoader<Internal_genericLoader<Internal_genericLoaderArgs<Types_AcalEscrow_OrderLocked_event,Types_loaderContext>,loaderReturn>,Internal_genericHandler<Internal_genericHandlerArgs<Types_AcalEscrow_OrderLocked_event,Types_handlerContext,loaderReturn>>,Types_AcalEscrow_OrderLocked_eventFilters>) => void; 
    handler: Types_fnWithEventConfig<Internal_genericHandler<Internal_genericHandlerArgs<Types_AcalEscrow_OrderLocked_event,Types_handlerContext,void>>,Types_HandlerTypes_eventConfig<Types_AcalEscrow_OrderLocked_eventFilters>>; 
    contractRegister: Types_fnWithEventConfig<Internal_genericContractRegister<Internal_genericContractRegisterArgs<Types_AcalEscrow_OrderLocked_event,Types_contractRegistrations>>,Types_HandlerTypes_eventConfig<Types_AcalEscrow_OrderLocked_eventFilters>>
  }
} = HandlersJS.AcalEscrow as any;

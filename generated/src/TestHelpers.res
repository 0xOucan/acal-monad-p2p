/***** TAKE NOTE ******
This is a hack to get genType to work!

In order for genType to produce recursive types, it needs to be at the 
root module of a file. If it's defined in a nested module it does not 
work. So all the MockDb types and internal functions are defined in TestHelpers_MockDb
and only public functions are recreated and exported from this module.

the following module:
```rescript
module MyModule = {
  @genType
  type rec a = {fieldB: b}
  @genType and b = {fieldA: a}
}
```

produces the following in ts:
```ts
// tslint:disable-next-line:interface-over-type-literal
export type MyModule_a = { readonly fieldB: b };

// tslint:disable-next-line:interface-over-type-literal
export type MyModule_b = { readonly fieldA: MyModule_a };
```

fieldB references type b which doesn't exist because it's defined
as MyModule_b
*/

module MockDb = {
  @genType
  let createMockDb = TestHelpers_MockDb.createMockDb
}

@genType
module Addresses = {
  include TestHelpers_MockAddresses
}

module EventFunctions = {
  //Note these are made into a record to make operate in the same way
  //for Res, JS and TS.

  /**
  The arguements that get passed to a "processEvent" helper function
  */
  @genType
  type eventProcessorArgs<'event> = {
    event: 'event,
    mockDb: TestHelpers_MockDb.t,
    @deprecated("Set the chainId for the event instead")
    chainId?: int,
  }

  @genType
  type eventProcessor<'event> = eventProcessorArgs<'event> => promise<TestHelpers_MockDb.t>

  /**
  A function composer to help create individual processEvent functions
  */
  let makeEventProcessor = (~register) => args => {
    let {event, mockDb, ?chainId} =
      args->(Utils.magic: eventProcessorArgs<'event> => eventProcessorArgs<Internal.event>)

    // Have the line here, just in case the function is called with
    // a manually created event. We don't want to break the existing tests here.
    let _ =
      TestHelpers_MockDb.mockEventRegisters->Utils.WeakMap.set(event, register)
    TestHelpers_MockDb.makeProcessEvents(mockDb, ~chainId=?chainId)([event->(Utils.magic: Internal.event => Types.eventLog<unknown>)])
  }

  module MockBlock = {
    @genType
    type t = {
      hash?: string,
      number?: int,
      timestamp?: int,
    }

    let toBlock = (_mock: t) => {
      hash: _mock.hash->Belt.Option.getWithDefault("foo"),
      number: _mock.number->Belt.Option.getWithDefault(0),
      timestamp: _mock.timestamp->Belt.Option.getWithDefault(0),
    }->(Utils.magic: Types.AggregatedBlock.t => Internal.eventBlock)
  }

  module MockTransaction = {
    @genType
    type t = {
      gasPrice?: option<bigint>,
      gasUsed?: bigint,
      hash?: string,
      transactionIndex?: int,
    }

    let toTransaction = (_mock: t) => {
      gasPrice: _mock.gasPrice->Belt.Option.getWithDefault(None),
      gasUsed: _mock.gasUsed->Belt.Option.getWithDefault(0n),
      hash: _mock.hash->Belt.Option.getWithDefault("foo"),
      transactionIndex: _mock.transactionIndex->Belt.Option.getWithDefault(0),
    }->(Utils.magic: Types.AggregatedTransaction.t => Internal.eventTransaction)
  }

  @genType
  type mockEventData = {
    chainId?: int,
    srcAddress?: Address.t,
    logIndex?: int,
    block?: MockBlock.t,
    transaction?: MockTransaction.t,
  }

  /**
  Applies optional paramters with defaults for all common eventLog field
  */
  let makeEventMocker = (
    ~params: Internal.eventParams,
    ~mockEventData: option<mockEventData>,
    ~register: unit => Internal.eventConfig,
  ): Internal.event => {
    let {?block, ?transaction, ?srcAddress, ?chainId, ?logIndex} =
      mockEventData->Belt.Option.getWithDefault({})
    let block = block->Belt.Option.getWithDefault({})->MockBlock.toBlock
    let transaction = transaction->Belt.Option.getWithDefault({})->MockTransaction.toTransaction
    let config = RegisterHandlers.getConfig()
    let event: Internal.event = {
      params,
      transaction,
      chainId: switch chainId {
      | Some(chainId) => chainId
      | None =>
        switch config.defaultChain {
        | Some(chainConfig) => chainConfig.chain->ChainMap.Chain.toChainId
        | None =>
          Js.Exn.raiseError(
            "No default chain Id found, please add at least 1 chain to your config.yaml",
          )
        }
      },
      block,
      srcAddress: srcAddress->Belt.Option.getWithDefault(Addresses.defaultAddress),
      logIndex: logIndex->Belt.Option.getWithDefault(0),
    }
    // Since currently it's not possible to figure out the event config from the event
    // we store a reference to the register function by event in a weak map
    let _ = TestHelpers_MockDb.mockEventRegisters->Utils.WeakMap.set(event, register)
    event
  }
}


module AcalEscrow = {
  module OrderCreated = {
    @genType
    let processEvent: EventFunctions.eventProcessor<Types.AcalEscrow.OrderCreated.event> = EventFunctions.makeEventProcessor(
      ~register=(Types.AcalEscrow.OrderCreated.register :> unit => Internal.eventConfig),
    )

    @genType
    type createMockArgs = {
      @as("id")
      id?: bigint,
      @as("maker")
      maker?: Address.t,
      @as("mxn")
      mxn?: bigint,
      @as("mon")
      mon?: bigint,
      @as("expiry")
      expiry?: bigint,
      mockEventData?: EventFunctions.mockEventData,
    }

    @genType
    let createMockEvent = args => {
      let {
        ?id,
        ?maker,
        ?mxn,
        ?mon,
        ?expiry,
        ?mockEventData,
      } = args

      let params = 
      {
       id: id->Belt.Option.getWithDefault(0n),
       maker: maker->Belt.Option.getWithDefault(TestHelpers_MockAddresses.defaultAddress),
       mxn: mxn->Belt.Option.getWithDefault(0n),
       mon: mon->Belt.Option.getWithDefault(0n),
       expiry: expiry->Belt.Option.getWithDefault(0n),
      }
->(Utils.magic: Types.AcalEscrow.OrderCreated.eventArgs => Internal.eventParams)

      EventFunctions.makeEventMocker(
        ~params,
        ~mockEventData,
        ~register=(Types.AcalEscrow.OrderCreated.register :> unit => Internal.eventConfig),
      )->(Utils.magic: Internal.event => Types.AcalEscrow.OrderCreated.event)
    }
  }

  module OrderLocked = {
    @genType
    let processEvent: EventFunctions.eventProcessor<Types.AcalEscrow.OrderLocked.event> = EventFunctions.makeEventProcessor(
      ~register=(Types.AcalEscrow.OrderLocked.register :> unit => Internal.eventConfig),
    )

    @genType
    type createMockArgs = {
      @as("id")
      id?: bigint,
      @as("taker")
      taker?: Address.t,
      @as("value")
      value?: bigint,
      mockEventData?: EventFunctions.mockEventData,
    }

    @genType
    let createMockEvent = args => {
      let {
        ?id,
        ?taker,
        ?value,
        ?mockEventData,
      } = args

      let params = 
      {
       id: id->Belt.Option.getWithDefault(0n),
       taker: taker->Belt.Option.getWithDefault(TestHelpers_MockAddresses.defaultAddress),
       value: value->Belt.Option.getWithDefault(0n),
      }
->(Utils.magic: Types.AcalEscrow.OrderLocked.eventArgs => Internal.eventParams)

      EventFunctions.makeEventMocker(
        ~params,
        ~mockEventData,
        ~register=(Types.AcalEscrow.OrderLocked.register :> unit => Internal.eventConfig),
      )->(Utils.magic: Internal.event => Types.AcalEscrow.OrderLocked.event)
    }
  }

  module OrderCompleted = {
    @genType
    let processEvent: EventFunctions.eventProcessor<Types.AcalEscrow.OrderCompleted.event> = EventFunctions.makeEventProcessor(
      ~register=(Types.AcalEscrow.OrderCompleted.register :> unit => Internal.eventConfig),
    )

    @genType
    type createMockArgs = {
      @as("id")
      id?: bigint,
      mockEventData?: EventFunctions.mockEventData,
    }

    @genType
    let createMockEvent = args => {
      let {
        ?id,
        ?mockEventData,
      } = args

      let params = 
      {
       id: id->Belt.Option.getWithDefault(0n),
      }
->(Utils.magic: Types.AcalEscrow.OrderCompleted.eventArgs => Internal.eventParams)

      EventFunctions.makeEventMocker(
        ~params,
        ~mockEventData,
        ~register=(Types.AcalEscrow.OrderCompleted.register :> unit => Internal.eventConfig),
      )->(Utils.magic: Internal.event => Types.AcalEscrow.OrderCompleted.event)
    }
  }

}


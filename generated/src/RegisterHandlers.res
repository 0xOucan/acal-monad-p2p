@val external require: string => unit = "require"

let registerContractHandlers = (
  ~contractName,
  ~handlerPathRelativeToRoot,
  ~handlerPathRelativeToConfig,
) => {
  try {
    require(`../${Path.relativePathToRootFromGenerated}/${handlerPathRelativeToRoot}`)
  } catch {
  | exn =>
    let params = {
      "Contract Name": contractName,
      "Expected Handler Path": handlerPathRelativeToConfig,
      "Code": "EE500",
    }
    let logger = Logging.createChild(~params)

    let errHandler = exn->ErrorHandling.make(~msg="Failed to import handler file", ~logger)
    errHandler->ErrorHandling.log
    errHandler->ErrorHandling.raiseExn
  }
}

%%private(
  let makeGeneratedConfig = () => {
    let chains = [
      {
        let contracts = [
          {
            Config.name: "AcalEscrow",
            abi: Types.AcalEscrow.abi,
            addresses: [
              "0x9486f6C9d28ECdd95aba5bfa6188Bbc104d89C3e"->Address.Evm.fromStringOrThrow
,
            ],
            events: [
              (Types.AcalEscrow.OrderCreated.register() :> Internal.eventConfig),
              (Types.AcalEscrow.OrderLocked.register() :> Internal.eventConfig),
              (Types.AcalEscrow.OrderCompleted.register() :> Internal.eventConfig),
              (Types.AcalEscrow.OrderCancelled.register() :> Internal.eventConfig),
              (Types.AcalEscrow.OrderDisputed.register() :> Internal.eventConfig),
            ],
            startBlock: None,
          },
        ]
        let chain = ChainMap.Chain.makeUnsafe(~chainId=10143)
        {
          Config.confirmedBlockThreshold: 200,
          startBlock: 32680036,
          endBlock: None,
          chain,
          contracts,
          sources: NetworkSources.evm(~chain, ~contracts=[{name: "AcalEscrow",events: [Types.AcalEscrow.OrderCreated.register(), Types.AcalEscrow.OrderLocked.register(), Types.AcalEscrow.OrderCompleted.register(), Types.AcalEscrow.OrderCancelled.register(), Types.AcalEscrow.OrderDisputed.register()],abi: Types.AcalEscrow.abi}], ~hyperSync=Some("https://10143.hypersync.xyz"), ~allEventSignatures=[Types.AcalEscrow.eventSignatures]->Belt.Array.concatMany, ~shouldUseHypersyncClientDecoder=true, ~rpcs=[])
        }
      },
    ]

    Config.make(
      ~shouldRollbackOnReorg=true,
      ~shouldSaveFullHistory=false,
      ~isUnorderedMultichainMode=false,
      ~chains,
      ~enableRawEvents=false,
    )
  }

  let config: ref<option<Config.t>> = ref(None)
)

let registerAllHandlers = () => {
  registerContractHandlers(
    ~contractName="AcalEscrow",
    ~handlerPathRelativeToRoot="src/EventHandlers.ts",
    ~handlerPathRelativeToConfig="src/EventHandlers.ts",
  )

  let generatedConfig = makeGeneratedConfig()
  config := Some(generatedConfig)
  generatedConfig
}

let getConfig = () => {
  switch config.contents {
  | Some(config) => config
  | None => registerAllHandlers()
  }
}

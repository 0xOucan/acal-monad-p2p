open Table
open Enums.EntityType
type id = string

type internalEntity = Internal.entity
module type Entity = {
  type t
  let name: Enums.EntityType.t
  let schema: S.t<t>
  let rowsSchema: S.t<array<t>>
  let table: Table.table
  let entityHistory: EntityHistory.t<t>
}
external entityModToInternal: module(Entity with type t = 'a) => Internal.entityConfig = "%identity"
external entityModsToInternal: array<module(Entity)> => array<Internal.entityConfig> = "%identity"
external entitiesToInternal: array<'a> => array<Internal.entity> = "%identity"

@get
external getEntityId: internalEntity => string = "id"

exception UnexpectedIdNotDefinedOnEntity
let getEntityIdUnsafe = (entity: 'entity): id =>
  switch Utils.magic(entity)["id"] {
  | Some(id) => id
  | None =>
    UnexpectedIdNotDefinedOnEntity->ErrorHandling.mkLogAndRaise(
      ~msg="Property 'id' does not exist on expected entity object",
    )
  }

//shorthand for punning
let isPrimaryKey = true
let isNullable = true
let isArray = true
let isIndex = true

@genType
type whereOperations<'entity, 'fieldType> = {
  eq: 'fieldType => promise<array<'entity>>,
  gt: 'fieldType => promise<array<'entity>>
}

module GlobalStats = {
  let name = GlobalStats
  @genType
  type t = {
    cancelledOrders: bigint,
    completedOrders: bigint,
    disputedOrders: bigint,
    id: id,
    lastUpdated: bigint,
    lockedOrders: bigint,
    openOrders: bigint,
    totalOrders: bigint,
    totalVolumeMON: bigint,
    totalVolumeMXN: bigint,
  }

  let schema = S.object((s): t => {
    cancelledOrders: s.field("cancelledOrders", BigInt.schema),
    completedOrders: s.field("completedOrders", BigInt.schema),
    disputedOrders: s.field("disputedOrders", BigInt.schema),
    id: s.field("id", S.string),
    lastUpdated: s.field("lastUpdated", BigInt.schema),
    lockedOrders: s.field("lockedOrders", BigInt.schema),
    openOrders: s.field("openOrders", BigInt.schema),
    totalOrders: s.field("totalOrders", BigInt.schema),
    totalVolumeMON: s.field("totalVolumeMON", BigInt.schema),
    totalVolumeMXN: s.field("totalVolumeMXN", BigInt.schema),
  })

  let rowsSchema = S.array(schema)

  @genType
  type indexedFieldOperations = {
    
  }

  let table = mkTable(
    (name :> string),
    ~fields=[
      mkField(
      "cancelledOrders", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "completedOrders", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "disputedOrders", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "id", 
      Text,
      ~fieldSchema=S.string,
      ~isPrimaryKey,
      
      
      
      
      ),
      mkField(
      "lastUpdated", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "lockedOrders", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "openOrders", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "totalOrders", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "totalVolumeMON", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "totalVolumeMXN", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField("db_write_timestamp", TimestampWithoutTimezone, ~fieldSchema=Utils.Schema.dbDate, ~default="CURRENT_TIMESTAMP"),
    ],
  )

  let entityHistory = table->EntityHistory.fromTable(~pgSchema=Env.Db.publicSchema, ~schema)

  external castToInternal: t => Internal.entity = "%identity"
}

module Order = {
  let name = Order
  @genType
  type t = {
    cancellationTxHash: option<string>,
    cancelledAt: option<bigint>,
    completedAt: option<bigint>,
    completionTxHash: option<string>,
    crHash: string,
    createdAt: bigint,
    creationTxHash: string,
    disputeTxHash: option<string>,
    disputedAt: option<bigint>,
    expiry: bigint,
    hashQR: string,
    id: id,
    lockTxHash: option<string>,
    lockedAt: option<bigint>,
    maker: string,
    mon: bigint,
    mxn: bigint,
    status: Enums.OrderStatus.t,
    taker: option<string>,
  }

  let schema = S.object((s): t => {
    cancellationTxHash: s.field("cancellationTxHash", S.null(S.string)),
    cancelledAt: s.field("cancelledAt", S.null(BigInt.schema)),
    completedAt: s.field("completedAt", S.null(BigInt.schema)),
    completionTxHash: s.field("completionTxHash", S.null(S.string)),
    crHash: s.field("crHash", S.string),
    createdAt: s.field("createdAt", BigInt.schema),
    creationTxHash: s.field("creationTxHash", S.string),
    disputeTxHash: s.field("disputeTxHash", S.null(S.string)),
    disputedAt: s.field("disputedAt", S.null(BigInt.schema)),
    expiry: s.field("expiry", BigInt.schema),
    hashQR: s.field("hashQR", S.string),
    id: s.field("id", S.string),
    lockTxHash: s.field("lockTxHash", S.null(S.string)),
    lockedAt: s.field("lockedAt", S.null(BigInt.schema)),
    maker: s.field("maker", S.string),
    mon: s.field("mon", BigInt.schema),
    mxn: s.field("mxn", BigInt.schema),
    status: s.field("status", Enums.OrderStatus.config.schema),
    taker: s.field("taker", S.null(S.string)),
  })

  let rowsSchema = S.array(schema)

  @genType
  type indexedFieldOperations = {
    
  }

  let table = mkTable(
    (name :> string),
    ~fields=[
      mkField(
      "cancellationTxHash", 
      Text,
      ~fieldSchema=S.null(S.string),
      
      ~isNullable,
      
      
      
      ),
      mkField(
      "cancelledAt", 
      Numeric,
      ~fieldSchema=S.null(BigInt.schema),
      
      ~isNullable,
      
      
      
      ),
      mkField(
      "completedAt", 
      Numeric,
      ~fieldSchema=S.null(BigInt.schema),
      
      ~isNullable,
      
      
      
      ),
      mkField(
      "completionTxHash", 
      Text,
      ~fieldSchema=S.null(S.string),
      
      ~isNullable,
      
      
      
      ),
      mkField(
      "crHash", 
      Text,
      ~fieldSchema=S.string,
      
      
      
      
      
      ),
      mkField(
      "createdAt", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "creationTxHash", 
      Text,
      ~fieldSchema=S.string,
      
      
      
      
      
      ),
      mkField(
      "disputeTxHash", 
      Text,
      ~fieldSchema=S.null(S.string),
      
      ~isNullable,
      
      
      
      ),
      mkField(
      "disputedAt", 
      Numeric,
      ~fieldSchema=S.null(BigInt.schema),
      
      ~isNullable,
      
      
      
      ),
      mkField(
      "expiry", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "hashQR", 
      Text,
      ~fieldSchema=S.string,
      
      
      
      
      
      ),
      mkField(
      "id", 
      Text,
      ~fieldSchema=S.string,
      ~isPrimaryKey,
      
      
      
      
      ),
      mkField(
      "lockTxHash", 
      Text,
      ~fieldSchema=S.null(S.string),
      
      ~isNullable,
      
      
      
      ),
      mkField(
      "lockedAt", 
      Numeric,
      ~fieldSchema=S.null(BigInt.schema),
      
      ~isNullable,
      
      
      
      ),
      mkField(
      "maker", 
      Text,
      ~fieldSchema=S.string,
      
      
      
      
      
      ),
      mkField(
      "mon", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "mxn", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "status", 
      Custom(Enums.OrderStatus.config.name),
      ~fieldSchema=Enums.OrderStatus.config.schema,
      
      
      
      
      
      ),
      mkField(
      "taker", 
      Text,
      ~fieldSchema=S.null(S.string),
      
      ~isNullable,
      
      
      
      ),
      mkField("db_write_timestamp", TimestampWithoutTimezone, ~fieldSchema=Utils.Schema.dbDate, ~default="CURRENT_TIMESTAMP"),
    ],
  )

  let entityHistory = table->EntityHistory.fromTable(~pgSchema=Env.Db.publicSchema, ~schema)

  external castToInternal: t => Internal.entity = "%identity"
}

module OrderEvent = {
  let name = OrderEvent
  @genType
  type t = {
    blockNumber: bigint,
    blockTimestamp: bigint,
    eventType: Enums.OrderEventType.t,
    gasPrice: bigint,
    gasUsed: bigint,
    id: id,
    maker: option<string>,
    orderId: bigint,
    taker: option<string>,
    transactionHash: string,
  }

  let schema = S.object((s): t => {
    blockNumber: s.field("blockNumber", BigInt.schema),
    blockTimestamp: s.field("blockTimestamp", BigInt.schema),
    eventType: s.field("eventType", Enums.OrderEventType.config.schema),
    gasPrice: s.field("gasPrice", BigInt.schema),
    gasUsed: s.field("gasUsed", BigInt.schema),
    id: s.field("id", S.string),
    maker: s.field("maker", S.null(S.string)),
    orderId: s.field("orderId", BigInt.schema),
    taker: s.field("taker", S.null(S.string)),
    transactionHash: s.field("transactionHash", S.string),
  })

  let rowsSchema = S.array(schema)

  @genType
  type indexedFieldOperations = {
    
  }

  let table = mkTable(
    (name :> string),
    ~fields=[
      mkField(
      "blockNumber", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "blockTimestamp", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "eventType", 
      Custom(Enums.OrderEventType.config.name),
      ~fieldSchema=Enums.OrderEventType.config.schema,
      
      
      
      
      
      ),
      mkField(
      "gasPrice", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "gasUsed", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "id", 
      Text,
      ~fieldSchema=S.string,
      ~isPrimaryKey,
      
      
      
      
      ),
      mkField(
      "maker", 
      Text,
      ~fieldSchema=S.null(S.string),
      
      ~isNullable,
      
      
      
      ),
      mkField(
      "orderId", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "taker", 
      Text,
      ~fieldSchema=S.null(S.string),
      
      ~isNullable,
      
      
      
      ),
      mkField(
      "transactionHash", 
      Text,
      ~fieldSchema=S.string,
      
      
      
      
      
      ),
      mkField("db_write_timestamp", TimestampWithoutTimezone, ~fieldSchema=Utils.Schema.dbDate, ~default="CURRENT_TIMESTAMP"),
    ],
  )

  let entityHistory = table->EntityHistory.fromTable(~pgSchema=Env.Db.publicSchema, ~schema)

  external castToInternal: t => Internal.entity = "%identity"
}

let userEntities = [
  module(GlobalStats),
  module(Order),
  module(OrderEvent),
]->entityModsToInternal

let allEntities =
  userEntities->Js.Array2.concat(
    [module(TablesStatic.DynamicContractRegistry)]->entityModsToInternal,
  )

let byName =
  allEntities
  ->Js.Array2.map(entityConfig => {
    (entityConfig.name, entityConfig)
  })
  ->Js.Dict.fromArray

module ContractType = {
  @genType
  type t = 
    | @as("AcalEscrow") AcalEscrow

  let name = "CONTRACT_TYPE"
  let variants = [
    AcalEscrow,
  ]
  let config = Internal.makeEnumConfig(~name, ~variants)
}

module EntityType = {
  @genType
  type t = 
    | @as("GlobalStats") GlobalStats
    | @as("Order") Order
    | @as("OrderEvent") OrderEvent
    | @as("dynamic_contract_registry") DynamicContractRegistry

  let name = "ENTITY_TYPE"
  let variants = [
    GlobalStats,
    Order,
    OrderEvent,
    DynamicContractRegistry,
  ]
  let config = Internal.makeEnumConfig(~name, ~variants)
}

module OrderEventType = {
  @genType
  type t = 
    | @as("CREATED") CREATED
    | @as("LOCKED") LOCKED
    | @as("COMPLETED") COMPLETED
    | @as("CANCELLED") CANCELLED
    | @as("DISPUTED") DISPUTED

  let name = "OrderEventType"
  let variants = [
    CREATED,
    LOCKED,
    COMPLETED,
    CANCELLED,
    DISPUTED,
  ]
  let config = Internal.makeEnumConfig(~name, ~variants)
}

module OrderStatus = {
  @genType
  type t = 
    | @as("OPEN") OPEN
    | @as("LOCKED") LOCKED
    | @as("COMPLETED") COMPLETED
    | @as("CANCELLED") CANCELLED
    | @as("DISPUTED") DISPUTED
    | @as("EXPIRED") EXPIRED

  let name = "OrderStatus"
  let variants = [
    OPEN,
    LOCKED,
    COMPLETED,
    CANCELLED,
    DISPUTED,
    EXPIRED,
  ]
  let config = Internal.makeEnumConfig(~name, ~variants)
}

let allEnums = ([
  ContractType.config->Internal.fromGenericEnumConfig,
  EntityType.config->Internal.fromGenericEnumConfig,
  OrderEventType.config->Internal.fromGenericEnumConfig,
  OrderStatus.config->Internal.fromGenericEnumConfig,
])

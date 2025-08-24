  @genType
module AcalEscrow = {
  module OrderCreated = Types.MakeRegister(Types.AcalEscrow.OrderCreated)
  module OrderLocked = Types.MakeRegister(Types.AcalEscrow.OrderLocked)
  module OrderCompleted = Types.MakeRegister(Types.AcalEscrow.OrderCompleted)
}


  @genType
module AcalEscrow = {
  module OrderCreated = Types.MakeRegister(Types.AcalEscrow.OrderCreated)
  module OrderLocked = Types.MakeRegister(Types.AcalEscrow.OrderLocked)
  module OrderCompleted = Types.MakeRegister(Types.AcalEscrow.OrderCompleted)
  module OrderCancelled = Types.MakeRegister(Types.AcalEscrow.OrderCancelled)
  module OrderDisputed = Types.MakeRegister(Types.AcalEscrow.OrderDisputed)
}


module {
  public func run(old : { nextId : Nat }) : { nextId : Nat; nextLobbyId : Nat } = {
    nextId = old.nextId;
    nextLobbyId = 0;
  };
};

import Map "mo:core/Map";
import Array "mo:core/Array";
import Text "mo:core/Text";
import List "mo:core/List";
import Iter "mo:core/Iter";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Int "mo:core/Int";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Nat "mo:core/Nat";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import Migration "migration";

(with migration = Migration.run)
actor {
  type UserProfile = {
    name : Text;
  };

  type Listing = {
    id : Nat;
    title : Text;
    description : Text;
    price : Nat;
    location : Text;
    condition : Text;
    category : Text;
    owner : Principal;
    timestamp : Time.Time;
  };

  type LobbyStatus = {
    #waiting;
    #inProgress;
    #finished;
  };

  type Lobby = {
    id : Nat;
    creator : Principal;
    players : [Principal];
    maxPlayers : Nat;
    status : LobbyStatus;
    createdAt : Time.Time;
  };

  type PlayerAction = {
    player : Principal;
    action : Text;
    timestamp : Time.Time;
    sequenceNumber : Nat;
  };

  type Match = {
    lobbyId : Nat;
    players : [Principal];
    actions : [PlayerAction];
    startedAt : Time.Time;
  };

  let accessControlState = AccessControl.initState();

  include MixinAuthorization(accessControlState);

  var nextId = 0;
  var nextLobbyId = 0;

  let userProfiles = Map.empty<Principal, UserProfile>();
  let listings = Map.empty<Nat, Listing>();
  let lobbies = Map.empty<Nat, Lobby>();
  let matches = Map.empty<Nat, Match>();

  // User Profile Functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Listing Functions
  public shared ({ caller }) func createListing(title : Text, description : Text, price : Nat, location : Text, condition : Text, category : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create listings");
    };

    let newListing : Listing = {
      id = nextId;
      title;
      description;
      price;
      location;
      condition;
      category;
      owner = caller;
      timestamp = Time.now();
    };

    listings.add(nextId, newListing);
    nextId += 1;
    newListing.id;
  };

  public query ({ caller }) func getListing(id : Nat) : async ?Listing {
    listings.get(id);
  };

  module Listing {
    public func compareByTimestamp(listing1 : Listing, listing2 : Listing) : Order.Order {
      Int.compare(listing2.timestamp, listing1.timestamp);
    };
  };

  public query ({ caller }) func getAllListings() : async [Listing] {
    listings.values().toArray().sort(Listing.compareByTimestamp);
  };

  public query ({ caller }) func getListingsByOwner(owner : Principal) : async [Listing] {
    let filtered = listings.values().toArray().filter(
      func(listing) {
        listing.owner == owner;
      }
    );
    filtered.sort(Listing.compareByTimestamp);
  };

  public query ({ caller }) func searchListingsByText(searchText : Text) : async [Listing] {
    let filtered = listings.values().toArray().filter(
      func(listing) {
        listing.title.toLower().contains(#text(searchText.toLower())) or listing.description.toLower().contains(#text(searchText.toLower()));
      }
    );
    filtered.sort(Listing.compareByTimestamp);
  };

  public query ({ caller }) func filterListingsByLocation(location : Text) : async [Listing] {
    let filtered = listings.values().toArray().filter(
      func(listing) {
        listing.location == location;
      }
    );
    filtered.sort(Listing.compareByTimestamp);
  };

  public query ({ caller }) func filterListingsByCondition(condition : Text) : async [Listing] {
    let filtered = listings.values().toArray().filter(
      func(listing) {
        listing.condition == condition;
      }
    );
    filtered.sort(Listing.compareByTimestamp);
  };

  public query ({ caller }) func filterListingsByCategory(category : Text) : async [Listing] {
    let filtered = listings.values().toArray().filter(
      func(listing) {
        listing.category == category;
      }
    );
    filtered.sort(Listing.compareByTimestamp);
  };

  public query ({ caller }) func filterListingsByLocationAndCondition(location : Text, condition : Text) : async [Listing] {
    let filtered = listings.values().toArray().filter(
      func(listing) {
        listing.location == location and listing.condition == condition;
      }
    );
    filtered.sort(Listing.compareByTimestamp);
  };

  public query ({ caller }) func filterListingsByCategoryAndPriceRange(category : Text, minPrice : Nat, maxPrice : Nat) : async [Listing] {
    let filtered = listings.values().toArray().filter(
      func(listing) {
        listing.category == category and listing.price >= minPrice and listing.price <= maxPrice;
      }
    );
    filtered.sort(Listing.compareByTimestamp);
  };

  public query ({ caller }) func searchFilterListings(text : Text, location : Text, condition : Text, category : Text, minPrice : Nat, maxPrice : Nat) : async [Listing] {
    let filtered = listings.values().toArray().filter(
      func(listing) {
        (listing.title.toLower().contains(#text(text.toLower())) or listing.description.toLower().contains(#text(text.toLower()))) and listing.location == location and listing.condition == condition and listing.category == category and listing.price >= minPrice and listing.price <= maxPrice;
      }
    );
    filtered.sort(Listing.compareByTimestamp);
  };

  public query ({ caller }) func filterListingsByPriceRange(minPrice : Nat, maxPrice : Nat) : async [Listing] {
    let filtered = listings.values().toArray().filter(
      func(listing) {
        listing.price >= minPrice and listing.price <= maxPrice;
      }
    );
    filtered.sort(Listing.compareByTimestamp);
  };

  public query ({ caller }) func getNewestListings(limit : Nat) : async [Listing] {
    let count = Nat.min(listings.size(), limit);
    let sortedListings = listings.values().toArray().sort(Listing.compareByTimestamp);
    sortedListings.sliceToArray(0, count);
  };

  public query ({ caller }) func getListingsPaginated(page : Nat, pageSize : Nat) : async [Listing] {
    let sortedListings = listings.values().toArray().sort(Listing.compareByTimestamp);
    let start = page * pageSize;
    let end = Nat.min(start + pageSize, sortedListings.size());

    if (start >= sortedListings.size()) {
      return [];
    };

    sortedListings.sliceToArray(start, end);
  };

  public shared ({ caller }) func updateListing(id : Nat, title : Text, description : Text, price : Nat, location : Text, condition : Text, category : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update listings");
    };

    switch (listings.get(id)) {
      case (null) { Runtime.trap("Listing does not exist") };
      case (?listing) {
        if (listing.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only update your own listings");
        };

        let updatedListing : Listing = {
          listing with
          title;
          description;
          price;
          location;
          condition;
          category;
        };
        listings.add(id, updatedListing);
      };
    };
  };

  public shared ({ caller }) func deleteListing(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete listings");
    };

    switch (listings.get(id)) {
      case (null) { Runtime.trap("Listing does not exist") };
      case (?listing) {
        if (listing.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only delete your own listings");
        };
        listings.remove(id);
      };
    };
  };

  public query ({ caller }) func getListingCount() : async Nat {
    listings.size();
  };

  public query ({ caller }) func getAllLocations() : async [Text] {
    let locations = List.empty<Text>();
    for (listing in listings.values()) {
      if (not locations.contains(listing.location)) {
        locations.add(listing.location);
      };
    };
    locations.toArray();
  };

  public query ({ caller }) func getAllCategories() : async [Text] {
    let categories = List.empty<Text>();
    for (listing in listings.values()) {
      if (not categories.contains(listing.category)) {
        categories.add(listing.category);
      };
    };
    categories.toArray();
  };

  public query ({ caller }) func getAllConditions() : async [Text] {
    let conditions = List.empty<Text>();
    for (listing in listings.values()) {
      if (not conditions.contains(listing.condition)) {
        conditions.add(listing.condition);
      };
    };
    conditions.toArray();
  };

  // Multiplayer Lobby Functions
  public shared ({ caller }) func createLobby(maxPlayers : Nat) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create lobbies");
    };

    if (maxPlayers < 2 or maxPlayers > 10) {
      Runtime.trap("Invalid maxPlayers: must be between 2 and 10");
    };

    let newLobby : Lobby = {
      id = nextLobbyId;
      creator = caller;
      players = [caller];
      maxPlayers;
      status = #waiting;
      createdAt = Time.now();
    };

    lobbies.add(nextLobbyId, newLobby);
    nextLobbyId += 1;
    newLobby.id;
  };

  public shared ({ caller }) func joinLobby(lobbyId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can join lobbies");
    };

    switch (lobbies.get(lobbyId)) {
      case (null) { Runtime.trap("Lobby does not exist") };
      case (?lobby) {
        if (lobby.status != #waiting) {
          Runtime.trap("Cannot join: Lobby is not in waiting status");
        };

        if (lobby.players.size() >= lobby.maxPlayers) {
          Runtime.trap("Cannot join: Lobby is full");
        };

        let alreadyJoined = lobby.players.find(func(p) { p == caller });
        if (alreadyJoined != null) {
          Runtime.trap("Already joined this lobby");
        };

        let updatedPlayers = lobby.players.concat([caller]);
        let updatedLobby : Lobby = {
          lobby with
          players = updatedPlayers;
        };
        lobbies.add(lobbyId, updatedLobby);
      };
    };
  };

  public query ({ caller }) func getLobby(lobbyId : Nat) : async ?Lobby {
    lobbies.get(lobbyId);
  };

  public query ({ caller }) func getAllLobbies() : async [Lobby] {
    lobbies.values().toArray();
  };

  public query ({ caller }) func getWaitingLobbies() : async [Lobby] {
    lobbies.values().toArray().filter(
      func(lobby) {
        lobby.status == #waiting;
      }
    );
  };

  public shared ({ caller }) func startMatch(lobbyId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can start matches");
    };

    switch (lobbies.get(lobbyId)) {
      case (null) { Runtime.trap("Lobby does not exist") };
      case (?lobby) {
        if (lobby.creator != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only the lobby creator can start the match");
        };

        if (lobby.status != #waiting) {
          Runtime.trap("Cannot start: Lobby is not in waiting status");
        };

        if (lobby.players.size() < 2) {
          Runtime.trap("Cannot start: Need at least 2 players");
        };

        let updatedLobby : Lobby = {
          lobby with
          status = #inProgress;
        };
        lobbies.add(lobbyId, updatedLobby);

        let newMatch : Match = {
          lobbyId;
          players = lobby.players;
          actions = [];
          startedAt = Time.now();
        };
        matches.add(lobbyId, newMatch);
      };
    };
  };

  public shared ({ caller }) func submitAction(lobbyId : Nat, action : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can submit actions");
    };

    switch (matches.get(lobbyId)) {
      case (null) { Runtime.trap("Match does not exist") };
      case (?match) {
        let isPlayer = match.players.find(func(p) { p == caller });
        if (isPlayer == null) {
          Runtime.trap("Unauthorized: Only players in this match can submit actions");
        };

        let playerAction : PlayerAction = {
          player = caller;
          action;
          timestamp = Time.now();
          sequenceNumber = match.actions.size();
        };

        let updatedActions = match.actions.concat([playerAction]);
        let updatedMatch : Match = {
          match with
          actions = updatedActions;
        };
        matches.add(lobbyId, updatedMatch);
      };
    };
  };

  public query ({ caller }) func getMatch(lobbyId : Nat) : async ?Match {
    matches.get(lobbyId);
  };

  public query ({ caller }) func getMatchActions(lobbyId : Nat) : async [PlayerAction] {
    switch (matches.get(lobbyId)) {
      case (null) { [] };
      case (?match) { match.actions };
    };
  };

  public shared ({ caller }) func leaveLobby(lobbyId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can leave lobbies");
    };

    switch (lobbies.get(lobbyId)) {
      case (null) { Runtime.trap("Lobby does not exist") };
      case (?lobby) {
        if (lobby.status != #waiting) {
          Runtime.trap("Cannot leave: Lobby is not in waiting status");
        };

        let updatedPlayers = lobby.players.filter(func(p) { p != caller });

        if (updatedPlayers.size() == lobby.players.size()) {
          Runtime.trap("You are not in this lobby");
        };

        if (updatedPlayers.size() == 0) {
          lobbies.remove(lobbyId);
        } else {
          let newCreator = if (lobby.creator == caller) {
            updatedPlayers[0];
          } else {
            lobby.creator;
          };

          let updatedLobby : Lobby = {
            lobby with
            creator = newCreator;
            players = updatedPlayers;
          };
          lobbies.add(lobbyId, updatedLobby);
        };
      };
    };
  };
};

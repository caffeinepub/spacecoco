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

  let accessControlState = AccessControl.initState();

  include MixinAuthorization(accessControlState);

  var nextId = 0;

  let userProfiles = Map.empty<Principal, UserProfile>();
  let listings = Map.empty<Nat, Listing>();

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
};

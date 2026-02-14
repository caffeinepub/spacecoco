import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface PlayerAction {
    action: string;
    player: Principal;
    timestamp: Time;
    sequenceNumber: bigint;
}
export type Time = bigint;
export interface Listing {
    id: bigint;
    title: string;
    owner: Principal;
    description: string;
    timestamp: Time;
    category: string;
    price: bigint;
    location: string;
    condition: string;
}
export interface Match {
    startedAt: Time;
    actions: Array<PlayerAction>;
    players: Array<Principal>;
    lobbyId: bigint;
}
export interface Lobby {
    id: bigint;
    status: LobbyStatus;
    creator: Principal;
    createdAt: Time;
    players: Array<Principal>;
    maxPlayers: bigint;
}
export interface UserProfile {
    name: string;
}
export enum LobbyStatus {
    finished = "finished",
    waiting = "waiting",
    inProgress = "inProgress"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createListing(title: string, description: string, price: bigint, location: string, condition: string, category: string): Promise<bigint>;
    createLobby(maxPlayers: bigint): Promise<bigint>;
    deleteListing(id: bigint): Promise<void>;
    filterListingsByCategory(category: string): Promise<Array<Listing>>;
    filterListingsByCategoryAndPriceRange(category: string, minPrice: bigint, maxPrice: bigint): Promise<Array<Listing>>;
    filterListingsByCondition(condition: string): Promise<Array<Listing>>;
    filterListingsByLocation(location: string): Promise<Array<Listing>>;
    filterListingsByLocationAndCondition(location: string, condition: string): Promise<Array<Listing>>;
    filterListingsByPriceRange(minPrice: bigint, maxPrice: bigint): Promise<Array<Listing>>;
    getAllCategories(): Promise<Array<string>>;
    getAllConditions(): Promise<Array<string>>;
    getAllListings(): Promise<Array<Listing>>;
    getAllLobbies(): Promise<Array<Lobby>>;
    getAllLocations(): Promise<Array<string>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getListing(id: bigint): Promise<Listing | null>;
    getListingCount(): Promise<bigint>;
    getListingsByOwner(owner: Principal): Promise<Array<Listing>>;
    getListingsPaginated(page: bigint, pageSize: bigint): Promise<Array<Listing>>;
    getLobby(lobbyId: bigint): Promise<Lobby | null>;
    getMatch(lobbyId: bigint): Promise<Match | null>;
    getMatchActions(lobbyId: bigint): Promise<Array<PlayerAction>>;
    getNewestListings(limit: bigint): Promise<Array<Listing>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getWaitingLobbies(): Promise<Array<Lobby>>;
    isCallerAdmin(): Promise<boolean>;
    joinLobby(lobbyId: bigint): Promise<void>;
    leaveLobby(lobbyId: bigint): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    searchFilterListings(text: string, location: string, condition: string, category: string, minPrice: bigint, maxPrice: bigint): Promise<Array<Listing>>;
    searchListingsByText(searchText: string): Promise<Array<Listing>>;
    startMatch(lobbyId: bigint): Promise<void>;
    submitAction(lobbyId: bigint, action: string): Promise<void>;
    updateListing(id: bigint, title: string, description: string, price: bigint, location: string, condition: string, category: string): Promise<void>;
}

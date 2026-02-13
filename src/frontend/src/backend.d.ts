import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
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
export interface UserProfile {
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createListing(title: string, description: string, price: bigint, location: string, condition: string, category: string): Promise<bigint>;
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
    getAllLocations(): Promise<Array<string>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getListing(id: bigint): Promise<Listing | null>;
    getListingCount(): Promise<bigint>;
    getListingsByOwner(owner: Principal): Promise<Array<Listing>>;
    getListingsPaginated(page: bigint, pageSize: bigint): Promise<Array<Listing>>;
    getNewestListings(limit: bigint): Promise<Array<Listing>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    searchFilterListings(text: string, location: string, condition: string, category: string, minPrice: bigint, maxPrice: bigint): Promise<Array<Listing>>;
    searchListingsByText(searchText: string): Promise<Array<Listing>>;
    updateListing(id: bigint, title: string, description: string, price: bigint, location: string, condition: string, category: string): Promise<void>;
}

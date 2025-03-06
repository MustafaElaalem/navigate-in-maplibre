export interface RouteData {
    code: string
    routes: Route[]
    waypoints: Waypoint[]
}

export interface Route {
    legs: Leg[]
    weight_name: string
    weight: number
    duration: number
    distance: number
}

export interface Leg {
    steps: Step[]
    summary: string
    weight: number
    duration: number
    distance: number
}

export interface Step {
    geometry: string
    maneuver: Maneuver
    mode: string
    driving_side: string
    name: string
    intersections: Intersection[]
    weight: number
    duration: number
    distance: number
    ref?: string
    rotary_name?: string
}

export interface Maneuver {
    bearing_after: number
    bearing_before: number
    location: number[]
    type: string
    modifier?: string
    exit?: number
}

export interface Intersection {
    out?: number
    entry: boolean[]
    bearings: number[]
    location: number[]
    in?: number
    classes?: string[]
}

export interface Waypoint {
    hint: string
    distance: number
    name: string
    location: number[]
}


export type PlacePoint = {
    place_id: number;
    licence: string;
    osm_type: string;
    osm_id: number;
    lat: string;
    lon: string;
    class: string;
    type: string;
    place_rank: number;
    importance: number;
    addresstype: string;
    name: string;
    display_name: string;
    boundingbox: string[];
};
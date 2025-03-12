export interface RouteWithGeometry {
    code: string
    routes: Route[]
    waypoints: Waypoint[]
}

export interface Route {
    geometry: Geometry
    legs: Leg[]
    weight_name: string
    weight: number
    duration: number
    distance: number
}

export interface Geometry {
    coordinates: number[][]
    type: string
}

export interface Leg {
    steps: Step[]
    summary: string
    weight: number
    duration: number
    distance: number
}

export interface Step {
    geometry: Geometry2
    maneuver: Maneuver
    mode: string
    driving_side: string
    name: string
    intersections: Intersection[]
    weight: number
    duration: number
    distance: number
    ref?: string
}

export interface Geometry2 {
    coordinates: number[][]
    type: string
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
}

export interface Waypoint {
    hint: string
    distance: number
    name: string
    location: number[]
}

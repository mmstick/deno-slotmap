type Generation = number
type Idx = number

/** An Entity is a key to a SlotMap. It is a generational indice.
 *
 * A generational indice is a pair of two numbers. One is the ID of the slot in
 * the SlotMap, and the other is a generation that must be equal to the
 * generation stored in the slot for the key to be valid.
*/
export type Entity = [Generation, Idx]

/** SlotMap is an efficient arena-allocator with generational indices for keys
 *
 * This is similar to a slab arena, but each slot has a "generation" that is
 * used to determine if the slot is vacant, which is included in the entity created
 * on insert of a component to guarantee that the entity can only be used to fetch
 * that slot if the slot's generation remains the same.
 *
 * A slot is considered vacant when the generation number is odd. Removing an
 * entity will increment the generation of that slot, which will immediately
 * render all instances of that entity void. On the next insertion, the generation
 * is incremented again and a new entity is created with that generation.
 *
 * Performance-wise, this is similar to `array[idx]`, but with a version check
 * afterwards to check if the entity is still valid.
 */
export class SlotMap<C> {
    private store: Array<[Generation, C]> = []

    /** The map is empty if either no slots exists, or each slot is considered vacant. */
    is_empty(): boolean {
        for (const _ of this.iter()) return false
        return true
    }

    /** The total number of non-vacant slots in the map. */
    len(): number {
        let len = 0
        for (const _ of this.iter()) len += 1
        return len
    }

    /** Fetch the component of this entity, if the entity is still valid. */
    get(entity: Entity): null | C {
        const slot = this.store[entity[1]]
        return (slot && entity[0] == slot[0]) ? slot[1] : null
    }

    /** Adds a new component to the map, creating a new entity to reference it. */
    insert(comp: C): Entity {
        let idx = 0
        for (const slot of this.store) {
            if (slot[0] % 2 !== 0) {
                slot[0] += 1
                slot[1] = comp
                return [slot[0], idx]
            }

            idx += 1
        }

        this.store.push([0, comp])
        return [0, idx]
    }

    /** Removes an entity from the map, incrementing the generation to mark its slot vacant. */
    remove(entity: Entity): null | C {
        const slot = this.store[entity[1]]
        if (slot && entity[0] == slot[0]) {
            const comp = slot[1]
            slot[0] += 1;
            return comp
        }

        return null
    }

    /** Yields every non-vacant component and its entity */
    * iter(): IterableIterator<[Entity, C]> {
        let idx = 0
        for (const slot of this.store) {
            if (slot[0] % 2 === 0) {
                yield [[slot[0], idx], slot[1]]
            }

            idx += 1
        }
    }
}

/** Store secondary associations with an entity in a separate array
 *
 * Useful for constructing your own ECS. Implemented as an array with nullable
 * slots. The array will always be as highest entity ID that was stored. A
 * generational ID is also stored in filled slots to prevent a deleted entity's
 * component from being accessed by a new entity.
*/
export class SecondaryMap<C> {
    private store: Array<null | [Generation, C]> = []

    /** The map is empty if either no slots exists, or each slot is considered vacant. */
    is_empty(): boolean {
        for (const _ of this.iter()) return false
        return true
    }

    /** The total number of non-vacant slots in the map. */
    len(): number {
        let len = 0
        for (const _ of this.iter()) len += 1
        return len
    }

    /** Associates a new component for this entity. */
    insert(entity: Entity, comp: C) {
        const length = this.store.length;
        if (length >= entity[1]) {
            this.store.fill(null, length, entity[1]);
        }

        this.store[entity[1]] = [entity[0], comp];
    }

    /** Fetches an associated component for the entity if it exists. */
    get(entity: Entity): null | C {
        const slot = this.store[entity[1]];
        return (slot && entity[0] === slot[0]) ? slot[1] : null
    }

    /** Removes an associated component if it exists. */
    remove(entity: Entity): null | C {
        const slot = this.store[entity[1]];
        if (slot && entity[0] === slot[0]) {
            const comp = slot[1]
            this.store[entity[1]] = null;
            return comp
        }

        return null
    }

    /** Yields every non-vacant component and its entity. */
    * iter(): IterableIterator<[Entity, C]> {
        let idx = 0
        for (const slot of this.store) {
            if (slot) {
                yield [[slot[0], idx], slot[1]]
            }

            idx += 1
        }
    }
}
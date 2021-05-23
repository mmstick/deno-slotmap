# TypeScript SlotMap for Deno

An arena allocator with persistent unique keys via generational indices. This type of allocator is perfect for constructing complex graphs, or even an entity-component system.

A SlotMap is a vector where each element is a reusable slot. Slots are considered to be vacant when the generation of that slot is odd-numbered. Components added to the map increment the generation, and the generation is stored in the returned key along with the indice of the slot. When accessing a slot via the key, the generation of the key and slot is compared to determine if the key is stale.

Effectively identical to a slab, with similar performance to accessing an element in an array via its indice. There is a version check to compare if the key is valid for the component it is fetching.

## Examples

- [Doubly-Linked List](./examples/doubly-linked-list.ts)
- [Entity-Component System](./examples/entity-component-system.ts)

## Reference

Based on the excellent work in the Rust implementation which this is based on: [orlp/slotmap](https://github.com/orlp/slotmap)
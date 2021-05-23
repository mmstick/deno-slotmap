import { assertEquals } from "https://deno.land/std@0.97.0/testing/asserts.ts"

import {Entity, SlotMap} from '../src/lib.ts'

type ListKey = null | Entity

interface Node<T> {
    value: T,
    prev: ListKey,
    next: ListKey,
}

class List<T> {
    private map: SlotMap<Node<T>> = new SlotMap()
    tail: ListKey = null
    head: ListKey = null

    len(): number {
        return this.map.len()
    }

    push_head(value: T): ListKey {
        const k = this.map.insert({
            value,
            prev: null,
            next: this.head
        })

        const oldHead = this.head && this.map.get(this.head)
        if (oldHead !== null) {
            oldHead.prev = k
        } else {
            this.tail = k
        }

        this.head = k
        return k
    }

    push_tail(value: T): ListKey {
        const k = this.map.insert({ value, prev: this.tail, next: null })

        const oldTail = this.tail && this.map.get(this.tail)
        if (oldTail !== null) {
            oldTail.next = k
        } else {
            this.head = k
        }

        this.tail = k
        return k
    }

    pop_head(): null | T {
        if (!this.head) return null

        const oldHead = this.map.remove(this.head)
        if (oldHead) {
            this.head = oldHead.next
            return oldHead.value
        }

        return null
    }

    pop_tail(): null | T {
        if (!this.tail) return null

        const oldTail = this.map.remove(this.tail)
        if (oldTail) {
            this.tail = oldTail.prev
            return oldTail.value
        }

        return null
    }

    remove(key: ListKey): null | T {
        if (!key) return null

        const node = this.map.remove(key)
        if (node) {
            const prevNode = node.prev ? this.map.get(node.prev) : null
            if (prevNode) {
                prevNode.next = node.next
            } else {
                this.head = node.next
            }

            const nextNode = node.next ? this.map.get(node.next) : null
            if (nextNode) {
                nextNode.prev = node.prev
            } else {
                this.tail = node.prev
            }

            return node.value
        }

        return null
    }

    get(key: ListKey): null | T {
        const node = key ? this.map.get(key) : null
        return node ? node.value : null
    }
}

Deno.test("Doubly-Linked List", () => {
    const dll = new List()
    const k = dll.push_head(5)
    dll.push_tail(6)

    dll.push_head(3)
    dll.push_tail(7)
    dll.push_head(4)

    assertEquals(dll.len(), 5)
    assertEquals(dll.pop_head(), 4)
    assertEquals(dll.pop_head(), 3)
    assertEquals(dll.head, k)

    dll.push_head(10)
    assertEquals(dll.remove(k), 5)
    assertEquals(dll.pop_tail(), 7)
    assertEquals(dll.pop_tail(), 6)
    assertEquals(dll.pop_head(), 10)
    assertEquals(dll.pop_head(), null)
    assertEquals(dll.pop_tail(), null)
})

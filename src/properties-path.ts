import { PathProxy } from './properties-reader.types';

type NestedPathBranch = {
   dual: boolean;
   leaves: Map<string, string>;
   branches: NestedPath;
   readonly path: string;
   parent: NestedPathBranch | null;
}
type NestedPath = Record<string, NestedPathBranch>;

function addLeaf(branch: NestedPathBranch, leaf: string, key: string) {
   branch.leaves.set(leaf, key);
   if (Object.hasOwn(branch.branches, leaf)) {
      branch.dual = true;
   }
}
function addBranch(branch: NestedPathBranch, token: string) {
   const next = branch.branches[token] ??= childBranch(branch, token);
   if (branch.leaves.has(token)) {
      next.dual = true;
   }
   return next;
}

function childBranch(parent: NestedPathBranch | null, child = ''): NestedPathBranch {
   return {
      dual: false,
      leaves: new Map(),
      branches: Object.create(null),
      path: (parent?.path ? `${parent.path}.` : '') + child,
      parent
   };
}

function pathLayers(map: Map<string, string>) {
   const paths: NestedPathBranch = childBranch(null);

   for (const key of map.keys()) {
      const tokens = key.split('.');
      const leaf = tokens.pop()!;
      const path = tokens.reduce(
         (branch, token) => addBranch(branch, token),
         paths
      );
      addLeaf(path, leaf, key);
   }

   return paths;
}

function memoize<T, U>(fn: (cacheKey: T) => U): ((cacheKey: T) => U) {
   const cache = new Map<T, U>();
   return (key) => {
      if (!cache.has(key)) {
         cache.set(key, fn(key));
      }
      return cache.get(key)!;
   };
}

export function propertiesPath(map: Map<string, string>): PathProxy {
   const shape = pathLayers(map);
   const value = (layer: NestedPathBranch, key: string) => {
      if (!key) {
         return map.get(layer.path);
      }

      const leaf = layer.leaves.get(key);
      const branch = Object.hasOwn(layer.branches, key);

      if (branch) {
         return make(layer.branches[key]);
      }

      return (typeof leaf === 'string') ? map.get(leaf) : undefined
   };

   const make = memoize((layer: NestedPathBranch) => {
      const ownKeys = new Set([
         ...layer.leaves.keys(),
         ...Object.keys(layer.branches),
      ]);

      const target = Object.defineProperties(Object.create(null), Object.fromEntries(
         [...ownKeys].map(name => [name, {
            configurable: false,
            enumerable: true,
            get () {
               return value(layer, name);
            }
         }])
      ));

      if (layer.dual) {
         Object.defineProperty(target, '', {
            configurable: false,
            enumerable: true,
            get () {
               return value(layer, '');
            }
         })
      }

      return target;
   });

   return make(shape);
}


/**
 * Client
**/

import * as runtime from './runtime/client.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model User
 * 
 */
export type User = $Result.DefaultSelection<Prisma.$UserPayload>
/**
 * Model Session
 * 
 */
export type Session = $Result.DefaultSelection<Prisma.$SessionPayload>
/**
 * Model Surah
 * 
 */
export type Surah = $Result.DefaultSelection<Prisma.$SurahPayload>
/**
 * Model Verse
 * 
 */
export type Verse = $Result.DefaultSelection<Prisma.$VersePayload>
/**
 * Model UserMemoryState
 * 
 */
export type UserMemoryState = $Result.DefaultSelection<Prisma.$UserMemoryStatePayload>
/**
 * Model RecitationAudio
 * 
 */
export type RecitationAudio = $Result.DefaultSelection<Prisma.$RecitationAudioPayload>
/**
 * Model ReviewLog
 * 
 */
export type ReviewLog = $Result.DefaultSelection<Prisma.$ReviewLogPayload>

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient({
 *   adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })
 * })
 * // Fetch zero or more Users
 * const users = await prisma.user.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://pris.ly/d/client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  const U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient({
   *   adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })
   * })
   * // Fetch zero or more Users
   * const users = await prisma.user.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://pris.ly/d/client).
   */

  constructor(optionsArg ?: Prisma.PrismaClientConstructorArgs<ClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/orm/prisma-client/queries/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>

  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.user`: Exposes CRUD operations for the **User** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Users
    * const users = await prisma.user.findMany()
    * ```
    */
  get user(): Prisma.UserDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.session`: Exposes CRUD operations for the **Session** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Sessions
    * const sessions = await prisma.session.findMany()
    * ```
    */
  get session(): Prisma.SessionDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.surah`: Exposes CRUD operations for the **Surah** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Surahs
    * const surahs = await prisma.surah.findMany()
    * ```
    */
  get surah(): Prisma.SurahDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.verse`: Exposes CRUD operations for the **Verse** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Verses
    * const verses = await prisma.verse.findMany()
    * ```
    */
  get verse(): Prisma.VerseDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.userMemoryState`: Exposes CRUD operations for the **UserMemoryState** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more UserMemoryStates
    * const userMemoryStates = await prisma.userMemoryState.findMany()
    * ```
    */
  get userMemoryState(): Prisma.UserMemoryStateDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.recitationAudio`: Exposes CRUD operations for the **RecitationAudio** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more RecitationAudios
    * const recitationAudios = await prisma.recitationAudio.findMany()
    * ```
    */
  get recitationAudio(): Prisma.RecitationAudioDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.reviewLog`: Exposes CRUD operations for the **ReviewLog** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ReviewLogs
    * const reviewLogs = await prisma.reviewLog.findMany()
    * ```
    */
  get reviewLog(): Prisma.ReviewLogDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 7.10.0
   * Query Engine version: 0edf323efd1d98336f3f0a68684b56f689b900d3
   */
  export type PrismaVersion = {
    client: string
    engine: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import Bytes = runtime.Bytes
  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * Resolved type of the argument passed to the `PrismaClient` constructor.
   *
   * When called without a narrower options type (the common case), this resolves
   * to `PrismaClientOptions` directly, which produces a clear TypeScript error
   * message (`not assignable to parameter of type 'PrismaClientOptions'`) when
   * the argument is missing or incomplete. When the user supplies a narrower
   * options type (e.g. via a literal), it falls back to `Subset` to keep
   * filtering out unknown properties.
   */
  export type PrismaClientConstructorArgs<Options extends PrismaClientOptions> =
    [PrismaClientOptions] extends [Options] ? PrismaClientOptions : Subset<Options, PrismaClientOptions>;

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      ((Without<T, U> & U) | (Without<U, T> & T)) & object
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    User: 'User',
    Session: 'Session',
    Surah: 'Surah',
    Verse: 'Verse',
    UserMemoryState: 'UserMemoryState',
    RecitationAudio: 'RecitationAudio',
    ReviewLog: 'ReviewLog'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]



  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "user" | "session" | "surah" | "verse" | "userMemoryState" | "recitationAudio" | "reviewLog"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      User: {
        payload: Prisma.$UserPayload<ExtArgs>
        fields: Prisma.UserFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UserFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UserFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findFirst: {
            args: Prisma.UserFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UserFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findMany: {
            args: Prisma.UserFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          create: {
            args: Prisma.UserCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          createMany: {
            args: Prisma.UserCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.UserCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          delete: {
            args: Prisma.UserDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          update: {
            args: Prisma.UserUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          deleteMany: {
            args: Prisma.UserDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UserUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.UserUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          upsert: {
            args: Prisma.UserUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          aggregate: {
            args: Prisma.UserAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUser>
          }
          groupBy: {
            args: Prisma.UserGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserGroupByOutputType>[]
          }
          count: {
            args: Prisma.UserCountArgs<ExtArgs>
            result: $Utils.Optional<UserCountAggregateOutputType> | number
          }
        }
      }
      Session: {
        payload: Prisma.$SessionPayload<ExtArgs>
        fields: Prisma.SessionFieldRefs
        operations: {
          findUnique: {
            args: Prisma.SessionFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SessionPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.SessionFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SessionPayload>
          }
          findFirst: {
            args: Prisma.SessionFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SessionPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.SessionFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SessionPayload>
          }
          findMany: {
            args: Prisma.SessionFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SessionPayload>[]
          }
          create: {
            args: Prisma.SessionCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SessionPayload>
          }
          createMany: {
            args: Prisma.SessionCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.SessionCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SessionPayload>[]
          }
          delete: {
            args: Prisma.SessionDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SessionPayload>
          }
          update: {
            args: Prisma.SessionUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SessionPayload>
          }
          deleteMany: {
            args: Prisma.SessionDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.SessionUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.SessionUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SessionPayload>[]
          }
          upsert: {
            args: Prisma.SessionUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SessionPayload>
          }
          aggregate: {
            args: Prisma.SessionAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateSession>
          }
          groupBy: {
            args: Prisma.SessionGroupByArgs<ExtArgs>
            result: $Utils.Optional<SessionGroupByOutputType>[]
          }
          count: {
            args: Prisma.SessionCountArgs<ExtArgs>
            result: $Utils.Optional<SessionCountAggregateOutputType> | number
          }
        }
      }
      Surah: {
        payload: Prisma.$SurahPayload<ExtArgs>
        fields: Prisma.SurahFieldRefs
        operations: {
          findUnique: {
            args: Prisma.SurahFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SurahPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.SurahFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SurahPayload>
          }
          findFirst: {
            args: Prisma.SurahFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SurahPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.SurahFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SurahPayload>
          }
          findMany: {
            args: Prisma.SurahFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SurahPayload>[]
          }
          create: {
            args: Prisma.SurahCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SurahPayload>
          }
          createMany: {
            args: Prisma.SurahCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.SurahCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SurahPayload>[]
          }
          delete: {
            args: Prisma.SurahDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SurahPayload>
          }
          update: {
            args: Prisma.SurahUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SurahPayload>
          }
          deleteMany: {
            args: Prisma.SurahDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.SurahUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.SurahUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SurahPayload>[]
          }
          upsert: {
            args: Prisma.SurahUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SurahPayload>
          }
          aggregate: {
            args: Prisma.SurahAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateSurah>
          }
          groupBy: {
            args: Prisma.SurahGroupByArgs<ExtArgs>
            result: $Utils.Optional<SurahGroupByOutputType>[]
          }
          count: {
            args: Prisma.SurahCountArgs<ExtArgs>
            result: $Utils.Optional<SurahCountAggregateOutputType> | number
          }
        }
      }
      Verse: {
        payload: Prisma.$VersePayload<ExtArgs>
        fields: Prisma.VerseFieldRefs
        operations: {
          findUnique: {
            args: Prisma.VerseFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VersePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.VerseFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VersePayload>
          }
          findFirst: {
            args: Prisma.VerseFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VersePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.VerseFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VersePayload>
          }
          findMany: {
            args: Prisma.VerseFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VersePayload>[]
          }
          create: {
            args: Prisma.VerseCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VersePayload>
          }
          createMany: {
            args: Prisma.VerseCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.VerseCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VersePayload>[]
          }
          delete: {
            args: Prisma.VerseDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VersePayload>
          }
          update: {
            args: Prisma.VerseUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VersePayload>
          }
          deleteMany: {
            args: Prisma.VerseDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.VerseUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.VerseUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VersePayload>[]
          }
          upsert: {
            args: Prisma.VerseUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VersePayload>
          }
          aggregate: {
            args: Prisma.VerseAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateVerse>
          }
          groupBy: {
            args: Prisma.VerseGroupByArgs<ExtArgs>
            result: $Utils.Optional<VerseGroupByOutputType>[]
          }
          count: {
            args: Prisma.VerseCountArgs<ExtArgs>
            result: $Utils.Optional<VerseCountAggregateOutputType> | number
          }
        }
      }
      UserMemoryState: {
        payload: Prisma.$UserMemoryStatePayload<ExtArgs>
        fields: Prisma.UserMemoryStateFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UserMemoryStateFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserMemoryStatePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UserMemoryStateFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserMemoryStatePayload>
          }
          findFirst: {
            args: Prisma.UserMemoryStateFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserMemoryStatePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UserMemoryStateFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserMemoryStatePayload>
          }
          findMany: {
            args: Prisma.UserMemoryStateFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserMemoryStatePayload>[]
          }
          create: {
            args: Prisma.UserMemoryStateCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserMemoryStatePayload>
          }
          createMany: {
            args: Prisma.UserMemoryStateCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.UserMemoryStateCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserMemoryStatePayload>[]
          }
          delete: {
            args: Prisma.UserMemoryStateDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserMemoryStatePayload>
          }
          update: {
            args: Prisma.UserMemoryStateUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserMemoryStatePayload>
          }
          deleteMany: {
            args: Prisma.UserMemoryStateDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UserMemoryStateUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.UserMemoryStateUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserMemoryStatePayload>[]
          }
          upsert: {
            args: Prisma.UserMemoryStateUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserMemoryStatePayload>
          }
          aggregate: {
            args: Prisma.UserMemoryStateAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUserMemoryState>
          }
          groupBy: {
            args: Prisma.UserMemoryStateGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserMemoryStateGroupByOutputType>[]
          }
          count: {
            args: Prisma.UserMemoryStateCountArgs<ExtArgs>
            result: $Utils.Optional<UserMemoryStateCountAggregateOutputType> | number
          }
        }
      }
      RecitationAudio: {
        payload: Prisma.$RecitationAudioPayload<ExtArgs>
        fields: Prisma.RecitationAudioFieldRefs
        operations: {
          findUnique: {
            args: Prisma.RecitationAudioFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RecitationAudioPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.RecitationAudioFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RecitationAudioPayload>
          }
          findFirst: {
            args: Prisma.RecitationAudioFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RecitationAudioPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.RecitationAudioFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RecitationAudioPayload>
          }
          findMany: {
            args: Prisma.RecitationAudioFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RecitationAudioPayload>[]
          }
          create: {
            args: Prisma.RecitationAudioCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RecitationAudioPayload>
          }
          createMany: {
            args: Prisma.RecitationAudioCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.RecitationAudioCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RecitationAudioPayload>[]
          }
          delete: {
            args: Prisma.RecitationAudioDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RecitationAudioPayload>
          }
          update: {
            args: Prisma.RecitationAudioUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RecitationAudioPayload>
          }
          deleteMany: {
            args: Prisma.RecitationAudioDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.RecitationAudioUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.RecitationAudioUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RecitationAudioPayload>[]
          }
          upsert: {
            args: Prisma.RecitationAudioUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RecitationAudioPayload>
          }
          aggregate: {
            args: Prisma.RecitationAudioAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateRecitationAudio>
          }
          groupBy: {
            args: Prisma.RecitationAudioGroupByArgs<ExtArgs>
            result: $Utils.Optional<RecitationAudioGroupByOutputType>[]
          }
          count: {
            args: Prisma.RecitationAudioCountArgs<ExtArgs>
            result: $Utils.Optional<RecitationAudioCountAggregateOutputType> | number
          }
        }
      }
      ReviewLog: {
        payload: Prisma.$ReviewLogPayload<ExtArgs>
        fields: Prisma.ReviewLogFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ReviewLogFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReviewLogPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ReviewLogFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReviewLogPayload>
          }
          findFirst: {
            args: Prisma.ReviewLogFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReviewLogPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ReviewLogFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReviewLogPayload>
          }
          findMany: {
            args: Prisma.ReviewLogFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReviewLogPayload>[]
          }
          create: {
            args: Prisma.ReviewLogCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReviewLogPayload>
          }
          createMany: {
            args: Prisma.ReviewLogCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ReviewLogCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReviewLogPayload>[]
          }
          delete: {
            args: Prisma.ReviewLogDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReviewLogPayload>
          }
          update: {
            args: Prisma.ReviewLogUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReviewLogPayload>
          }
          deleteMany: {
            args: Prisma.ReviewLogDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ReviewLogUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ReviewLogUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReviewLogPayload>[]
          }
          upsert: {
            args: Prisma.ReviewLogUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReviewLogPayload>
          }
          aggregate: {
            args: Prisma.ReviewLogAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateReviewLog>
          }
          groupBy: {
            args: Prisma.ReviewLogGroupByArgs<ExtArgs>
            result: $Utils.Optional<ReviewLogGroupByOutputType>[]
          }
          count: {
            args: Prisma.ReviewLogCountArgs<ExtArgs>
            result: $Utils.Optional<ReviewLogCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Shorthand for `emit: 'stdout'`
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events only
     * log: [
     *   { emit: 'event', level: 'query' },
     *   { emit: 'event', level: 'info' },
     *   { emit: 'event', level: 'warn' }
     *   { emit: 'event', level: 'error' }
     * ]
     * 
     * / Emit as events and log to stdout
     * og: [
     *  { emit: 'stdout', level: 'query' },
     *  { emit: 'stdout', level: 'info' },
     *  { emit: 'stdout', level: 'warn' }
     *  { emit: 'stdout', level: 'error' }
     * 
     * ```
     * Read more in our [docs](https://pris.ly/d/logging).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * A driver adapter that PrismaClient uses to connect to your database, such as the ones provided by `@prisma/adapter-pg`, `@prisma/adapter-libsql`, `@prisma/adapter-planetscale`, etc.
     * 
     * A driver adapter is **required** unless you connect to your database through Prisma Accelerate (in which case use `accelerateUrl` instead).
     * 
     * Learn more: https://pris.ly/d/driver-adapters
     * 
     * @example
     * ```ts
     * import { PrismaPg } from '@prisma/adapter-pg'
     * import { PrismaClient } from './generated/prisma/client'
     * 
     * const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
     * const prisma = new PrismaClient({ adapter })
     * ```
     */
    adapter?: runtime.SqlDriverAdapterFactory
    /**
     * The Prisma Accelerate connection URL. Use this option to connect to your database through Prisma Accelerate instead of using a driver adapter to connect directly.
     * 
     * Learn more: https://pris.ly/d/accelerate
     */
    accelerateUrl?: string
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
    /**
     * SQL commenter plugins that add metadata to SQL queries as comments.
     * Comments follow the sqlcommenter format: https://google.github.io/sqlcommenter/
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   adapter,
     *   comments: [
     *     traceContext(),
     *     queryInsights(),
     *   ],
     * })
     * ```
     */
    comments?: runtime.SqlCommenterPlugin[]
  }
  export type GlobalOmitConfig = {
    user?: UserOmit
    session?: SessionOmit
    surah?: SurahOmit
    verse?: VerseOmit
    userMemoryState?: UserMemoryStateOmit
    recitationAudio?: RecitationAudioOmit
    reviewLog?: ReviewLogOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type CheckIsLogLevel<T> = T extends LogLevel ? T : never;

  export type GetLogType<T> = CheckIsLogLevel<
    T extends LogDefinition ? T['level'] : T
  >;

  export type GetEvents<T extends any[]> = T extends Array<LogLevel | LogDefinition>
    ? GetLogType<T[number]>
    : never;

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type UserCountOutputType
   */

  export type UserCountOutputType = {
    sessions: number
    memoryStates: number
    reviewLogs: number
  }

  export type UserCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    sessions?: boolean | UserCountOutputTypeCountSessionsArgs
    memoryStates?: boolean | UserCountOutputTypeCountMemoryStatesArgs
    reviewLogs?: boolean | UserCountOutputTypeCountReviewLogsArgs
  }

  // Custom InputTypes
  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserCountOutputType
     */
    select?: UserCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountSessionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SessionWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountMemoryStatesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserMemoryStateWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountReviewLogsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ReviewLogWhereInput
  }


  /**
   * Count Type VerseCountOutputType
   */

  export type VerseCountOutputType = {
    memoryStates: number
    reviewLogs: number
  }

  export type VerseCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    memoryStates?: boolean | VerseCountOutputTypeCountMemoryStatesArgs
    reviewLogs?: boolean | VerseCountOutputTypeCountReviewLogsArgs
  }

  // Custom InputTypes
  /**
   * VerseCountOutputType without action
   */
  export type VerseCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VerseCountOutputType
     */
    select?: VerseCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * VerseCountOutputType without action
   */
  export type VerseCountOutputTypeCountMemoryStatesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserMemoryStateWhereInput
  }

  /**
   * VerseCountOutputType without action
   */
  export type VerseCountOutputTypeCountReviewLogsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ReviewLogWhereInput
  }


  /**
   * Models
   */

  /**
   * Model User
   */

  export type AggregateUser = {
    _count: UserCountAggregateOutputType | null
    _avg: UserAvgAggregateOutputType | null
    _sum: UserSumAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  export type UserAvgAggregateOutputType = {
    dailyTargetCount: number | null
    currentStreak: number | null
    longestStreak: number | null
    requestRetention: number | null
  }

  export type UserSumAggregateOutputType = {
    dailyTargetCount: number | null
    currentStreak: number | null
    longestStreak: number | null
    requestRetention: number | null
  }

  export type UserMinAggregateOutputType = {
    id: string | null
    email: string | null
    passwordHash: string | null
    createdAt: Date | null
    dailyTargetCount: number | null
    currentStreak: number | null
    longestStreak: number | null
    lastActiveDate: Date | null
    scheduler: string | null
    requestRetention: number | null
  }

  export type UserMaxAggregateOutputType = {
    id: string | null
    email: string | null
    passwordHash: string | null
    createdAt: Date | null
    dailyTargetCount: number | null
    currentStreak: number | null
    longestStreak: number | null
    lastActiveDate: Date | null
    scheduler: string | null
    requestRetention: number | null
  }

  export type UserCountAggregateOutputType = {
    id: number
    email: number
    passwordHash: number
    createdAt: number
    dailyTargetCount: number
    currentStreak: number
    longestStreak: number
    lastActiveDate: number
    scheduler: number
    requestRetention: number
    _all: number
  }


  export type UserAvgAggregateInputType = {
    dailyTargetCount?: true
    currentStreak?: true
    longestStreak?: true
    requestRetention?: true
  }

  export type UserSumAggregateInputType = {
    dailyTargetCount?: true
    currentStreak?: true
    longestStreak?: true
    requestRetention?: true
  }

  export type UserMinAggregateInputType = {
    id?: true
    email?: true
    passwordHash?: true
    createdAt?: true
    dailyTargetCount?: true
    currentStreak?: true
    longestStreak?: true
    lastActiveDate?: true
    scheduler?: true
    requestRetention?: true
  }

  export type UserMaxAggregateInputType = {
    id?: true
    email?: true
    passwordHash?: true
    createdAt?: true
    dailyTargetCount?: true
    currentStreak?: true
    longestStreak?: true
    lastActiveDate?: true
    scheduler?: true
    requestRetention?: true
  }

  export type UserCountAggregateInputType = {
    id?: true
    email?: true
    passwordHash?: true
    createdAt?: true
    dailyTargetCount?: true
    currentStreak?: true
    longestStreak?: true
    lastActiveDate?: true
    scheduler?: true
    requestRetention?: true
    _all?: true
  }

  export type UserAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which User to aggregate.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Users
    **/
    _count?: true | UserCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: UserAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: UserSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserMaxAggregateInputType
  }

  export type GetUserAggregateType<T extends UserAggregateArgs> = {
        [P in keyof T & keyof AggregateUser]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUser[P]>
      : GetScalarType<T[P], AggregateUser[P]>
  }




  export type UserGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserWhereInput
    orderBy?: UserOrderByWithAggregationInput | UserOrderByWithAggregationInput[]
    by: UserScalarFieldEnum[] | UserScalarFieldEnum
    having?: UserScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserCountAggregateInputType | true
    _avg?: UserAvgAggregateInputType
    _sum?: UserSumAggregateInputType
    _min?: UserMinAggregateInputType
    _max?: UserMaxAggregateInputType
  }

  export type UserGroupByOutputType = {
    id: string
    email: string
    passwordHash: string | null
    createdAt: Date
    dailyTargetCount: number
    currentStreak: number
    longestStreak: number
    lastActiveDate: Date | null
    scheduler: string
    requestRetention: number
    _count: UserCountAggregateOutputType | null
    _avg: UserAvgAggregateOutputType | null
    _sum: UserSumAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  type GetUserGroupByPayload<T extends UserGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserGroupByOutputType[P]>
            : GetScalarType<T[P], UserGroupByOutputType[P]>
        }
      >
    >


  export type UserSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    passwordHash?: boolean
    createdAt?: boolean
    dailyTargetCount?: boolean
    currentStreak?: boolean
    longestStreak?: boolean
    lastActiveDate?: boolean
    scheduler?: boolean
    requestRetention?: boolean
    sessions?: boolean | User$sessionsArgs<ExtArgs>
    memoryStates?: boolean | User$memoryStatesArgs<ExtArgs>
    reviewLogs?: boolean | User$reviewLogsArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["user"]>

  export type UserSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    passwordHash?: boolean
    createdAt?: boolean
    dailyTargetCount?: boolean
    currentStreak?: boolean
    longestStreak?: boolean
    lastActiveDate?: boolean
    scheduler?: boolean
    requestRetention?: boolean
  }, ExtArgs["result"]["user"]>

  export type UserSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    passwordHash?: boolean
    createdAt?: boolean
    dailyTargetCount?: boolean
    currentStreak?: boolean
    longestStreak?: boolean
    lastActiveDate?: boolean
    scheduler?: boolean
    requestRetention?: boolean
  }, ExtArgs["result"]["user"]>

  export type UserSelectScalar = {
    id?: boolean
    email?: boolean
    passwordHash?: boolean
    createdAt?: boolean
    dailyTargetCount?: boolean
    currentStreak?: boolean
    longestStreak?: boolean
    lastActiveDate?: boolean
    scheduler?: boolean
    requestRetention?: boolean
  }

  export type UserOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "email" | "passwordHash" | "createdAt" | "dailyTargetCount" | "currentStreak" | "longestStreak" | "lastActiveDate" | "scheduler" | "requestRetention", ExtArgs["result"]["user"]>
  export type UserInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    sessions?: boolean | User$sessionsArgs<ExtArgs>
    memoryStates?: boolean | User$memoryStatesArgs<ExtArgs>
    reviewLogs?: boolean | User$reviewLogsArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type UserIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type UserIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $UserPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "User"
    objects: {
      sessions: Prisma.$SessionPayload<ExtArgs>[]
      memoryStates: Prisma.$UserMemoryStatePayload<ExtArgs>[]
      reviewLogs: Prisma.$ReviewLogPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      email: string
      passwordHash: string | null
      createdAt: Date
      dailyTargetCount: number
      currentStreak: number
      longestStreak: number
      lastActiveDate: Date | null
      scheduler: string
      requestRetention: number
    }, ExtArgs["result"]["user"]>
    composites: {}
  }

  type UserGetPayload<S extends boolean | null | undefined | UserDefaultArgs> = $Result.GetResult<Prisma.$UserPayload, S>

  type UserCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<UserFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: UserCountAggregateInputType | true
    }

  export interface UserDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['User'], meta: { name: 'User' } }
    /**
     * Find zero or one User that matches the filter.
     * @param {UserFindUniqueArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserFindUniqueArgs>(args: SelectSubset<T, UserFindUniqueArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one User that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {UserFindUniqueOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserFindUniqueOrThrowArgs>(args: SelectSubset<T, UserFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserFindFirstArgs>(args?: SelectSubset<T, UserFindFirstArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserFindFirstOrThrowArgs>(args?: SelectSubset<T, UserFindFirstOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Users that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Users
     * const users = await prisma.user.findMany()
     * 
     * // Get first 10 Users
     * const users = await prisma.user.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const userWithIdOnly = await prisma.user.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends UserFindManyArgs>(args?: SelectSubset<T, UserFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a User.
     * @param {UserCreateArgs} args - Arguments to create a User.
     * @example
     * // Create one User
     * const User = await prisma.user.create({
     *   data: {
     *     // ... data to create a User
     *   }
     * })
     * 
     */
    create<T extends UserCreateArgs>(args: SelectSubset<T, UserCreateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Users.
     * @param {UserCreateManyArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UserCreateManyArgs>(args?: SelectSubset<T, UserCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Users and returns the data saved in the database.
     * @param {UserCreateManyAndReturnArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Users and only return the `id`
     * const userWithIdOnly = await prisma.user.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends UserCreateManyAndReturnArgs>(args?: SelectSubset<T, UserCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a User.
     * @param {UserDeleteArgs} args - Arguments to delete one User.
     * @example
     * // Delete one User
     * const User = await prisma.user.delete({
     *   where: {
     *     // ... filter to delete one User
     *   }
     * })
     * 
     */
    delete<T extends UserDeleteArgs>(args: SelectSubset<T, UserDeleteArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one User.
     * @param {UserUpdateArgs} args - Arguments to update one User.
     * @example
     * // Update one User
     * const user = await prisma.user.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UserUpdateArgs>(args: SelectSubset<T, UserUpdateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Users.
     * @param {UserDeleteManyArgs} args - Arguments to filter Users to delete.
     * @example
     * // Delete a few Users
     * const { count } = await prisma.user.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UserDeleteManyArgs>(args?: SelectSubset<T, UserDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UserUpdateManyArgs>(args: SelectSubset<T, UserUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users and returns the data updated in the database.
     * @param {UserUpdateManyAndReturnArgs} args - Arguments to update many Users.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Users and only return the `id`
     * const userWithIdOnly = await prisma.user.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends UserUpdateManyAndReturnArgs>(args: SelectSubset<T, UserUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one User.
     * @param {UserUpsertArgs} args - Arguments to update or create a User.
     * @example
     * // Update or create a User
     * const user = await prisma.user.upsert({
     *   create: {
     *     // ... data to create a User
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the User we want to update
     *   }
     * })
     */
    upsert<T extends UserUpsertArgs>(args: SelectSubset<T, UserUpsertArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserCountArgs} args - Arguments to filter Users to count.
     * @example
     * // Count the number of Users
     * const count = await prisma.user.count({
     *   where: {
     *     // ... the filter for the Users we want to count
     *   }
     * })
    **/
    count<T extends UserCountArgs>(
      args?: Subset<T, UserCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UserAggregateArgs>(args: Subset<T, UserAggregateArgs>): Prisma.PrismaPromise<GetUserAggregateType<T>>

    /**
     * Group by User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends UserGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserGroupByArgs['orderBy'] }
        : { orderBy?: UserGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, UserGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the User model
   */
  readonly fields: UserFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for User.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    sessions<T extends User$sessionsArgs<ExtArgs> = {}>(args?: Subset<T, User$sessionsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SessionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    memoryStates<T extends User$memoryStatesArgs<ExtArgs> = {}>(args?: Subset<T, User$memoryStatesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserMemoryStatePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    reviewLogs<T extends User$reviewLogsArgs<ExtArgs> = {}>(args?: Subset<T, User$reviewLogsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ReviewLogPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the User model
   */
  interface UserFieldRefs {
    readonly id: FieldRef<"User", 'String'>
    readonly email: FieldRef<"User", 'String'>
    readonly passwordHash: FieldRef<"User", 'String'>
    readonly createdAt: FieldRef<"User", 'DateTime'>
    readonly dailyTargetCount: FieldRef<"User", 'Int'>
    readonly currentStreak: FieldRef<"User", 'Int'>
    readonly longestStreak: FieldRef<"User", 'Int'>
    readonly lastActiveDate: FieldRef<"User", 'DateTime'>
    readonly scheduler: FieldRef<"User", 'String'>
    readonly requestRetention: FieldRef<"User", 'Float'>
  }
    

  // Custom InputTypes
  /**
   * User findUnique
   */
  export type UserFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findUniqueOrThrow
   */
  export type UserFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findFirst
   */
  export type UserFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findFirstOrThrow
   */
  export type UserFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findMany
   */
  export type UserFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which Users to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User create
   */
  export type UserCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to create a User.
     */
    data: XOR<UserCreateInput, UserUncheckedCreateInput>
  }

  /**
   * User createMany
   */
  export type UserCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * User createManyAndReturn
   */
  export type UserCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * User update
   */
  export type UserUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to update a User.
     */
    data: XOR<UserUpdateInput, UserUncheckedUpdateInput>
    /**
     * Choose, which User to update.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User updateMany
   */
  export type UserUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
  }

  /**
   * User updateManyAndReturn
   */
  export type UserUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
  }

  /**
   * User upsert
   */
  export type UserUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The filter to search for the User to update in case it exists.
     */
    where: UserWhereUniqueInput
    /**
     * In case the User found by the `where` argument doesn't exist, create a new User with this data.
     */
    create: XOR<UserCreateInput, UserUncheckedCreateInput>
    /**
     * In case the User was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserUpdateInput, UserUncheckedUpdateInput>
  }

  /**
   * User delete
   */
  export type UserDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter which User to delete.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User deleteMany
   */
  export type UserDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Users to delete
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to delete.
     */
    limit?: number
  }

  /**
   * User.sessions
   */
  export type User$sessionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Session
     */
    select?: SessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Session
     */
    omit?: SessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionInclude<ExtArgs> | null
    where?: SessionWhereInput
    orderBy?: SessionOrderByWithRelationInput | SessionOrderByWithRelationInput[]
    cursor?: SessionWhereUniqueInput
    take?: number
    skip?: number
    distinct?: SessionScalarFieldEnum | SessionScalarFieldEnum[]
  }

  /**
   * User.memoryStates
   */
  export type User$memoryStatesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserMemoryState
     */
    select?: UserMemoryStateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserMemoryState
     */
    omit?: UserMemoryStateOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserMemoryStateInclude<ExtArgs> | null
    where?: UserMemoryStateWhereInput
    orderBy?: UserMemoryStateOrderByWithRelationInput | UserMemoryStateOrderByWithRelationInput[]
    cursor?: UserMemoryStateWhereUniqueInput
    take?: number
    skip?: number
    distinct?: UserMemoryStateScalarFieldEnum | UserMemoryStateScalarFieldEnum[]
  }

  /**
   * User.reviewLogs
   */
  export type User$reviewLogsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReviewLog
     */
    select?: ReviewLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReviewLog
     */
    omit?: ReviewLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReviewLogInclude<ExtArgs> | null
    where?: ReviewLogWhereInput
    orderBy?: ReviewLogOrderByWithRelationInput | ReviewLogOrderByWithRelationInput[]
    cursor?: ReviewLogWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ReviewLogScalarFieldEnum | ReviewLogScalarFieldEnum[]
  }

  /**
   * User without action
   */
  export type UserDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
  }


  /**
   * Model Session
   */

  export type AggregateSession = {
    _count: SessionCountAggregateOutputType | null
    _min: SessionMinAggregateOutputType | null
    _max: SessionMaxAggregateOutputType | null
  }

  export type SessionMinAggregateOutputType = {
    id: string | null
    token: string | null
    userId: string | null
    expiresAt: Date | null
    createdAt: Date | null
  }

  export type SessionMaxAggregateOutputType = {
    id: string | null
    token: string | null
    userId: string | null
    expiresAt: Date | null
    createdAt: Date | null
  }

  export type SessionCountAggregateOutputType = {
    id: number
    token: number
    userId: number
    expiresAt: number
    createdAt: number
    _all: number
  }


  export type SessionMinAggregateInputType = {
    id?: true
    token?: true
    userId?: true
    expiresAt?: true
    createdAt?: true
  }

  export type SessionMaxAggregateInputType = {
    id?: true
    token?: true
    userId?: true
    expiresAt?: true
    createdAt?: true
  }

  export type SessionCountAggregateInputType = {
    id?: true
    token?: true
    userId?: true
    expiresAt?: true
    createdAt?: true
    _all?: true
  }

  export type SessionAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Session to aggregate.
     */
    where?: SessionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Sessions to fetch.
     */
    orderBy?: SessionOrderByWithRelationInput | SessionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: SessionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Sessions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Sessions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Sessions
    **/
    _count?: true | SessionCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: SessionMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: SessionMaxAggregateInputType
  }

  export type GetSessionAggregateType<T extends SessionAggregateArgs> = {
        [P in keyof T & keyof AggregateSession]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateSession[P]>
      : GetScalarType<T[P], AggregateSession[P]>
  }




  export type SessionGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SessionWhereInput
    orderBy?: SessionOrderByWithAggregationInput | SessionOrderByWithAggregationInput[]
    by: SessionScalarFieldEnum[] | SessionScalarFieldEnum
    having?: SessionScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: SessionCountAggregateInputType | true
    _min?: SessionMinAggregateInputType
    _max?: SessionMaxAggregateInputType
  }

  export type SessionGroupByOutputType = {
    id: string
    token: string
    userId: string
    expiresAt: Date
    createdAt: Date
    _count: SessionCountAggregateOutputType | null
    _min: SessionMinAggregateOutputType | null
    _max: SessionMaxAggregateOutputType | null
  }

  type GetSessionGroupByPayload<T extends SessionGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<SessionGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof SessionGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], SessionGroupByOutputType[P]>
            : GetScalarType<T[P], SessionGroupByOutputType[P]>
        }
      >
    >


  export type SessionSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    token?: boolean
    userId?: boolean
    expiresAt?: boolean
    createdAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["session"]>

  export type SessionSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    token?: boolean
    userId?: boolean
    expiresAt?: boolean
    createdAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["session"]>

  export type SessionSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    token?: boolean
    userId?: boolean
    expiresAt?: boolean
    createdAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["session"]>

  export type SessionSelectScalar = {
    id?: boolean
    token?: boolean
    userId?: boolean
    expiresAt?: boolean
    createdAt?: boolean
  }

  export type SessionOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "token" | "userId" | "expiresAt" | "createdAt", ExtArgs["result"]["session"]>
  export type SessionInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type SessionIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type SessionIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $SessionPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Session"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      token: string
      userId: string
      expiresAt: Date
      createdAt: Date
    }, ExtArgs["result"]["session"]>
    composites: {}
  }

  type SessionGetPayload<S extends boolean | null | undefined | SessionDefaultArgs> = $Result.GetResult<Prisma.$SessionPayload, S>

  type SessionCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<SessionFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: SessionCountAggregateInputType | true
    }

  export interface SessionDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Session'], meta: { name: 'Session' } }
    /**
     * Find zero or one Session that matches the filter.
     * @param {SessionFindUniqueArgs} args - Arguments to find a Session
     * @example
     * // Get one Session
     * const session = await prisma.session.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends SessionFindUniqueArgs>(args: SelectSubset<T, SessionFindUniqueArgs<ExtArgs>>): Prisma__SessionClient<$Result.GetResult<Prisma.$SessionPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Session that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {SessionFindUniqueOrThrowArgs} args - Arguments to find a Session
     * @example
     * // Get one Session
     * const session = await prisma.session.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends SessionFindUniqueOrThrowArgs>(args: SelectSubset<T, SessionFindUniqueOrThrowArgs<ExtArgs>>): Prisma__SessionClient<$Result.GetResult<Prisma.$SessionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Session that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SessionFindFirstArgs} args - Arguments to find a Session
     * @example
     * // Get one Session
     * const session = await prisma.session.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends SessionFindFirstArgs>(args?: SelectSubset<T, SessionFindFirstArgs<ExtArgs>>): Prisma__SessionClient<$Result.GetResult<Prisma.$SessionPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Session that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SessionFindFirstOrThrowArgs} args - Arguments to find a Session
     * @example
     * // Get one Session
     * const session = await prisma.session.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends SessionFindFirstOrThrowArgs>(args?: SelectSubset<T, SessionFindFirstOrThrowArgs<ExtArgs>>): Prisma__SessionClient<$Result.GetResult<Prisma.$SessionPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Sessions that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SessionFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Sessions
     * const sessions = await prisma.session.findMany()
     * 
     * // Get first 10 Sessions
     * const sessions = await prisma.session.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const sessionWithIdOnly = await prisma.session.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends SessionFindManyArgs>(args?: SelectSubset<T, SessionFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SessionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Session.
     * @param {SessionCreateArgs} args - Arguments to create a Session.
     * @example
     * // Create one Session
     * const Session = await prisma.session.create({
     *   data: {
     *     // ... data to create a Session
     *   }
     * })
     * 
     */
    create<T extends SessionCreateArgs>(args: SelectSubset<T, SessionCreateArgs<ExtArgs>>): Prisma__SessionClient<$Result.GetResult<Prisma.$SessionPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Sessions.
     * @param {SessionCreateManyArgs} args - Arguments to create many Sessions.
     * @example
     * // Create many Sessions
     * const session = await prisma.session.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends SessionCreateManyArgs>(args?: SelectSubset<T, SessionCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Sessions and returns the data saved in the database.
     * @param {SessionCreateManyAndReturnArgs} args - Arguments to create many Sessions.
     * @example
     * // Create many Sessions
     * const session = await prisma.session.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Sessions and only return the `id`
     * const sessionWithIdOnly = await prisma.session.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends SessionCreateManyAndReturnArgs>(args?: SelectSubset<T, SessionCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SessionPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Session.
     * @param {SessionDeleteArgs} args - Arguments to delete one Session.
     * @example
     * // Delete one Session
     * const Session = await prisma.session.delete({
     *   where: {
     *     // ... filter to delete one Session
     *   }
     * })
     * 
     */
    delete<T extends SessionDeleteArgs>(args: SelectSubset<T, SessionDeleteArgs<ExtArgs>>): Prisma__SessionClient<$Result.GetResult<Prisma.$SessionPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Session.
     * @param {SessionUpdateArgs} args - Arguments to update one Session.
     * @example
     * // Update one Session
     * const session = await prisma.session.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends SessionUpdateArgs>(args: SelectSubset<T, SessionUpdateArgs<ExtArgs>>): Prisma__SessionClient<$Result.GetResult<Prisma.$SessionPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Sessions.
     * @param {SessionDeleteManyArgs} args - Arguments to filter Sessions to delete.
     * @example
     * // Delete a few Sessions
     * const { count } = await prisma.session.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends SessionDeleteManyArgs>(args?: SelectSubset<T, SessionDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Sessions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SessionUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Sessions
     * const session = await prisma.session.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends SessionUpdateManyArgs>(args: SelectSubset<T, SessionUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Sessions and returns the data updated in the database.
     * @param {SessionUpdateManyAndReturnArgs} args - Arguments to update many Sessions.
     * @example
     * // Update many Sessions
     * const session = await prisma.session.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Sessions and only return the `id`
     * const sessionWithIdOnly = await prisma.session.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends SessionUpdateManyAndReturnArgs>(args: SelectSubset<T, SessionUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SessionPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Session.
     * @param {SessionUpsertArgs} args - Arguments to update or create a Session.
     * @example
     * // Update or create a Session
     * const session = await prisma.session.upsert({
     *   create: {
     *     // ... data to create a Session
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Session we want to update
     *   }
     * })
     */
    upsert<T extends SessionUpsertArgs>(args: SelectSubset<T, SessionUpsertArgs<ExtArgs>>): Prisma__SessionClient<$Result.GetResult<Prisma.$SessionPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Sessions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SessionCountArgs} args - Arguments to filter Sessions to count.
     * @example
     * // Count the number of Sessions
     * const count = await prisma.session.count({
     *   where: {
     *     // ... the filter for the Sessions we want to count
     *   }
     * })
    **/
    count<T extends SessionCountArgs>(
      args?: Subset<T, SessionCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], SessionCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Session.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SessionAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends SessionAggregateArgs>(args: Subset<T, SessionAggregateArgs>): Prisma.PrismaPromise<GetSessionAggregateType<T>>

    /**
     * Group by Session.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SessionGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends SessionGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: SessionGroupByArgs['orderBy'] }
        : { orderBy?: SessionGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, SessionGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetSessionGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Session model
   */
  readonly fields: SessionFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Session.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__SessionClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Session model
   */
  interface SessionFieldRefs {
    readonly id: FieldRef<"Session", 'String'>
    readonly token: FieldRef<"Session", 'String'>
    readonly userId: FieldRef<"Session", 'String'>
    readonly expiresAt: FieldRef<"Session", 'DateTime'>
    readonly createdAt: FieldRef<"Session", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Session findUnique
   */
  export type SessionFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Session
     */
    select?: SessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Session
     */
    omit?: SessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionInclude<ExtArgs> | null
    /**
     * Filter, which Session to fetch.
     */
    where: SessionWhereUniqueInput
  }

  /**
   * Session findUniqueOrThrow
   */
  export type SessionFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Session
     */
    select?: SessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Session
     */
    omit?: SessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionInclude<ExtArgs> | null
    /**
     * Filter, which Session to fetch.
     */
    where: SessionWhereUniqueInput
  }

  /**
   * Session findFirst
   */
  export type SessionFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Session
     */
    select?: SessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Session
     */
    omit?: SessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionInclude<ExtArgs> | null
    /**
     * Filter, which Session to fetch.
     */
    where?: SessionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Sessions to fetch.
     */
    orderBy?: SessionOrderByWithRelationInput | SessionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Sessions.
     */
    cursor?: SessionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Sessions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Sessions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Sessions.
     */
    distinct?: SessionScalarFieldEnum | SessionScalarFieldEnum[]
  }

  /**
   * Session findFirstOrThrow
   */
  export type SessionFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Session
     */
    select?: SessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Session
     */
    omit?: SessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionInclude<ExtArgs> | null
    /**
     * Filter, which Session to fetch.
     */
    where?: SessionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Sessions to fetch.
     */
    orderBy?: SessionOrderByWithRelationInput | SessionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Sessions.
     */
    cursor?: SessionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Sessions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Sessions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Sessions.
     */
    distinct?: SessionScalarFieldEnum | SessionScalarFieldEnum[]
  }

  /**
   * Session findMany
   */
  export type SessionFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Session
     */
    select?: SessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Session
     */
    omit?: SessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionInclude<ExtArgs> | null
    /**
     * Filter, which Sessions to fetch.
     */
    where?: SessionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Sessions to fetch.
     */
    orderBy?: SessionOrderByWithRelationInput | SessionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Sessions.
     */
    cursor?: SessionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Sessions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Sessions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Sessions.
     */
    distinct?: SessionScalarFieldEnum | SessionScalarFieldEnum[]
  }

  /**
   * Session create
   */
  export type SessionCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Session
     */
    select?: SessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Session
     */
    omit?: SessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionInclude<ExtArgs> | null
    /**
     * The data needed to create a Session.
     */
    data: XOR<SessionCreateInput, SessionUncheckedCreateInput>
  }

  /**
   * Session createMany
   */
  export type SessionCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Sessions.
     */
    data: SessionCreateManyInput | SessionCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Session createManyAndReturn
   */
  export type SessionCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Session
     */
    select?: SessionSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Session
     */
    omit?: SessionOmit<ExtArgs> | null
    /**
     * The data used to create many Sessions.
     */
    data: SessionCreateManyInput | SessionCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Session update
   */
  export type SessionUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Session
     */
    select?: SessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Session
     */
    omit?: SessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionInclude<ExtArgs> | null
    /**
     * The data needed to update a Session.
     */
    data: XOR<SessionUpdateInput, SessionUncheckedUpdateInput>
    /**
     * Choose, which Session to update.
     */
    where: SessionWhereUniqueInput
  }

  /**
   * Session updateMany
   */
  export type SessionUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Sessions.
     */
    data: XOR<SessionUpdateManyMutationInput, SessionUncheckedUpdateManyInput>
    /**
     * Filter which Sessions to update
     */
    where?: SessionWhereInput
    /**
     * Limit how many Sessions to update.
     */
    limit?: number
  }

  /**
   * Session updateManyAndReturn
   */
  export type SessionUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Session
     */
    select?: SessionSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Session
     */
    omit?: SessionOmit<ExtArgs> | null
    /**
     * The data used to update Sessions.
     */
    data: XOR<SessionUpdateManyMutationInput, SessionUncheckedUpdateManyInput>
    /**
     * Filter which Sessions to update
     */
    where?: SessionWhereInput
    /**
     * Limit how many Sessions to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Session upsert
   */
  export type SessionUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Session
     */
    select?: SessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Session
     */
    omit?: SessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionInclude<ExtArgs> | null
    /**
     * The filter to search for the Session to update in case it exists.
     */
    where: SessionWhereUniqueInput
    /**
     * In case the Session found by the `where` argument doesn't exist, create a new Session with this data.
     */
    create: XOR<SessionCreateInput, SessionUncheckedCreateInput>
    /**
     * In case the Session was found with the provided `where` argument, update it with this data.
     */
    update: XOR<SessionUpdateInput, SessionUncheckedUpdateInput>
  }

  /**
   * Session delete
   */
  export type SessionDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Session
     */
    select?: SessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Session
     */
    omit?: SessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionInclude<ExtArgs> | null
    /**
     * Filter which Session to delete.
     */
    where: SessionWhereUniqueInput
  }

  /**
   * Session deleteMany
   */
  export type SessionDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Sessions to delete
     */
    where?: SessionWhereInput
    /**
     * Limit how many Sessions to delete.
     */
    limit?: number
  }

  /**
   * Session without action
   */
  export type SessionDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Session
     */
    select?: SessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Session
     */
    omit?: SessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionInclude<ExtArgs> | null
  }


  /**
   * Model Surah
   */

  export type AggregateSurah = {
    _count: SurahCountAggregateOutputType | null
    _avg: SurahAvgAggregateOutputType | null
    _sum: SurahSumAggregateOutputType | null
    _min: SurahMinAggregateOutputType | null
    _max: SurahMaxAggregateOutputType | null
  }

  export type SurahAvgAggregateOutputType = {
    id: number | null
    ayahCount: number | null
  }

  export type SurahSumAggregateOutputType = {
    id: number | null
    ayahCount: number | null
  }

  export type SurahMinAggregateOutputType = {
    id: number | null
    nameArabic: string | null
    nameSimple: string | null
    englishName: string | null
    revelationPlace: string | null
    ayahCount: number | null
  }

  export type SurahMaxAggregateOutputType = {
    id: number | null
    nameArabic: string | null
    nameSimple: string | null
    englishName: string | null
    revelationPlace: string | null
    ayahCount: number | null
  }

  export type SurahCountAggregateOutputType = {
    id: number
    nameArabic: number
    nameSimple: number
    englishName: number
    revelationPlace: number
    ayahCount: number
    _all: number
  }


  export type SurahAvgAggregateInputType = {
    id?: true
    ayahCount?: true
  }

  export type SurahSumAggregateInputType = {
    id?: true
    ayahCount?: true
  }

  export type SurahMinAggregateInputType = {
    id?: true
    nameArabic?: true
    nameSimple?: true
    englishName?: true
    revelationPlace?: true
    ayahCount?: true
  }

  export type SurahMaxAggregateInputType = {
    id?: true
    nameArabic?: true
    nameSimple?: true
    englishName?: true
    revelationPlace?: true
    ayahCount?: true
  }

  export type SurahCountAggregateInputType = {
    id?: true
    nameArabic?: true
    nameSimple?: true
    englishName?: true
    revelationPlace?: true
    ayahCount?: true
    _all?: true
  }

  export type SurahAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Surah to aggregate.
     */
    where?: SurahWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Surahs to fetch.
     */
    orderBy?: SurahOrderByWithRelationInput | SurahOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: SurahWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Surahs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Surahs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Surahs
    **/
    _count?: true | SurahCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: SurahAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: SurahSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: SurahMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: SurahMaxAggregateInputType
  }

  export type GetSurahAggregateType<T extends SurahAggregateArgs> = {
        [P in keyof T & keyof AggregateSurah]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateSurah[P]>
      : GetScalarType<T[P], AggregateSurah[P]>
  }




  export type SurahGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SurahWhereInput
    orderBy?: SurahOrderByWithAggregationInput | SurahOrderByWithAggregationInput[]
    by: SurahScalarFieldEnum[] | SurahScalarFieldEnum
    having?: SurahScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: SurahCountAggregateInputType | true
    _avg?: SurahAvgAggregateInputType
    _sum?: SurahSumAggregateInputType
    _min?: SurahMinAggregateInputType
    _max?: SurahMaxAggregateInputType
  }

  export type SurahGroupByOutputType = {
    id: number
    nameArabic: string
    nameSimple: string
    englishName: string
    revelationPlace: string
    ayahCount: number
    _count: SurahCountAggregateOutputType | null
    _avg: SurahAvgAggregateOutputType | null
    _sum: SurahSumAggregateOutputType | null
    _min: SurahMinAggregateOutputType | null
    _max: SurahMaxAggregateOutputType | null
  }

  type GetSurahGroupByPayload<T extends SurahGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<SurahGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof SurahGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], SurahGroupByOutputType[P]>
            : GetScalarType<T[P], SurahGroupByOutputType[P]>
        }
      >
    >


  export type SurahSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    nameArabic?: boolean
    nameSimple?: boolean
    englishName?: boolean
    revelationPlace?: boolean
    ayahCount?: boolean
  }, ExtArgs["result"]["surah"]>

  export type SurahSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    nameArabic?: boolean
    nameSimple?: boolean
    englishName?: boolean
    revelationPlace?: boolean
    ayahCount?: boolean
  }, ExtArgs["result"]["surah"]>

  export type SurahSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    nameArabic?: boolean
    nameSimple?: boolean
    englishName?: boolean
    revelationPlace?: boolean
    ayahCount?: boolean
  }, ExtArgs["result"]["surah"]>

  export type SurahSelectScalar = {
    id?: boolean
    nameArabic?: boolean
    nameSimple?: boolean
    englishName?: boolean
    revelationPlace?: boolean
    ayahCount?: boolean
  }

  export type SurahOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "nameArabic" | "nameSimple" | "englishName" | "revelationPlace" | "ayahCount", ExtArgs["result"]["surah"]>

  export type $SurahPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Surah"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: number
      nameArabic: string
      nameSimple: string
      englishName: string
      revelationPlace: string
      ayahCount: number
    }, ExtArgs["result"]["surah"]>
    composites: {}
  }

  type SurahGetPayload<S extends boolean | null | undefined | SurahDefaultArgs> = $Result.GetResult<Prisma.$SurahPayload, S>

  type SurahCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<SurahFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: SurahCountAggregateInputType | true
    }

  export interface SurahDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Surah'], meta: { name: 'Surah' } }
    /**
     * Find zero or one Surah that matches the filter.
     * @param {SurahFindUniqueArgs} args - Arguments to find a Surah
     * @example
     * // Get one Surah
     * const surah = await prisma.surah.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends SurahFindUniqueArgs>(args: SelectSubset<T, SurahFindUniqueArgs<ExtArgs>>): Prisma__SurahClient<$Result.GetResult<Prisma.$SurahPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Surah that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {SurahFindUniqueOrThrowArgs} args - Arguments to find a Surah
     * @example
     * // Get one Surah
     * const surah = await prisma.surah.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends SurahFindUniqueOrThrowArgs>(args: SelectSubset<T, SurahFindUniqueOrThrowArgs<ExtArgs>>): Prisma__SurahClient<$Result.GetResult<Prisma.$SurahPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Surah that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SurahFindFirstArgs} args - Arguments to find a Surah
     * @example
     * // Get one Surah
     * const surah = await prisma.surah.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends SurahFindFirstArgs>(args?: SelectSubset<T, SurahFindFirstArgs<ExtArgs>>): Prisma__SurahClient<$Result.GetResult<Prisma.$SurahPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Surah that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SurahFindFirstOrThrowArgs} args - Arguments to find a Surah
     * @example
     * // Get one Surah
     * const surah = await prisma.surah.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends SurahFindFirstOrThrowArgs>(args?: SelectSubset<T, SurahFindFirstOrThrowArgs<ExtArgs>>): Prisma__SurahClient<$Result.GetResult<Prisma.$SurahPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Surahs that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SurahFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Surahs
     * const surahs = await prisma.surah.findMany()
     * 
     * // Get first 10 Surahs
     * const surahs = await prisma.surah.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const surahWithIdOnly = await prisma.surah.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends SurahFindManyArgs>(args?: SelectSubset<T, SurahFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SurahPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Surah.
     * @param {SurahCreateArgs} args - Arguments to create a Surah.
     * @example
     * // Create one Surah
     * const Surah = await prisma.surah.create({
     *   data: {
     *     // ... data to create a Surah
     *   }
     * })
     * 
     */
    create<T extends SurahCreateArgs>(args: SelectSubset<T, SurahCreateArgs<ExtArgs>>): Prisma__SurahClient<$Result.GetResult<Prisma.$SurahPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Surahs.
     * @param {SurahCreateManyArgs} args - Arguments to create many Surahs.
     * @example
     * // Create many Surahs
     * const surah = await prisma.surah.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends SurahCreateManyArgs>(args?: SelectSubset<T, SurahCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Surahs and returns the data saved in the database.
     * @param {SurahCreateManyAndReturnArgs} args - Arguments to create many Surahs.
     * @example
     * // Create many Surahs
     * const surah = await prisma.surah.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Surahs and only return the `id`
     * const surahWithIdOnly = await prisma.surah.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends SurahCreateManyAndReturnArgs>(args?: SelectSubset<T, SurahCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SurahPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Surah.
     * @param {SurahDeleteArgs} args - Arguments to delete one Surah.
     * @example
     * // Delete one Surah
     * const Surah = await prisma.surah.delete({
     *   where: {
     *     // ... filter to delete one Surah
     *   }
     * })
     * 
     */
    delete<T extends SurahDeleteArgs>(args: SelectSubset<T, SurahDeleteArgs<ExtArgs>>): Prisma__SurahClient<$Result.GetResult<Prisma.$SurahPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Surah.
     * @param {SurahUpdateArgs} args - Arguments to update one Surah.
     * @example
     * // Update one Surah
     * const surah = await prisma.surah.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends SurahUpdateArgs>(args: SelectSubset<T, SurahUpdateArgs<ExtArgs>>): Prisma__SurahClient<$Result.GetResult<Prisma.$SurahPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Surahs.
     * @param {SurahDeleteManyArgs} args - Arguments to filter Surahs to delete.
     * @example
     * // Delete a few Surahs
     * const { count } = await prisma.surah.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends SurahDeleteManyArgs>(args?: SelectSubset<T, SurahDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Surahs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SurahUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Surahs
     * const surah = await prisma.surah.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends SurahUpdateManyArgs>(args: SelectSubset<T, SurahUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Surahs and returns the data updated in the database.
     * @param {SurahUpdateManyAndReturnArgs} args - Arguments to update many Surahs.
     * @example
     * // Update many Surahs
     * const surah = await prisma.surah.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Surahs and only return the `id`
     * const surahWithIdOnly = await prisma.surah.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends SurahUpdateManyAndReturnArgs>(args: SelectSubset<T, SurahUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SurahPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Surah.
     * @param {SurahUpsertArgs} args - Arguments to update or create a Surah.
     * @example
     * // Update or create a Surah
     * const surah = await prisma.surah.upsert({
     *   create: {
     *     // ... data to create a Surah
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Surah we want to update
     *   }
     * })
     */
    upsert<T extends SurahUpsertArgs>(args: SelectSubset<T, SurahUpsertArgs<ExtArgs>>): Prisma__SurahClient<$Result.GetResult<Prisma.$SurahPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Surahs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SurahCountArgs} args - Arguments to filter Surahs to count.
     * @example
     * // Count the number of Surahs
     * const count = await prisma.surah.count({
     *   where: {
     *     // ... the filter for the Surahs we want to count
     *   }
     * })
    **/
    count<T extends SurahCountArgs>(
      args?: Subset<T, SurahCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], SurahCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Surah.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SurahAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends SurahAggregateArgs>(args: Subset<T, SurahAggregateArgs>): Prisma.PrismaPromise<GetSurahAggregateType<T>>

    /**
     * Group by Surah.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SurahGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends SurahGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: SurahGroupByArgs['orderBy'] }
        : { orderBy?: SurahGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, SurahGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetSurahGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Surah model
   */
  readonly fields: SurahFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Surah.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__SurahClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Surah model
   */
  interface SurahFieldRefs {
    readonly id: FieldRef<"Surah", 'Int'>
    readonly nameArabic: FieldRef<"Surah", 'String'>
    readonly nameSimple: FieldRef<"Surah", 'String'>
    readonly englishName: FieldRef<"Surah", 'String'>
    readonly revelationPlace: FieldRef<"Surah", 'String'>
    readonly ayahCount: FieldRef<"Surah", 'Int'>
  }
    

  // Custom InputTypes
  /**
   * Surah findUnique
   */
  export type SurahFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Surah
     */
    select?: SurahSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Surah
     */
    omit?: SurahOmit<ExtArgs> | null
    /**
     * Filter, which Surah to fetch.
     */
    where: SurahWhereUniqueInput
  }

  /**
   * Surah findUniqueOrThrow
   */
  export type SurahFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Surah
     */
    select?: SurahSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Surah
     */
    omit?: SurahOmit<ExtArgs> | null
    /**
     * Filter, which Surah to fetch.
     */
    where: SurahWhereUniqueInput
  }

  /**
   * Surah findFirst
   */
  export type SurahFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Surah
     */
    select?: SurahSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Surah
     */
    omit?: SurahOmit<ExtArgs> | null
    /**
     * Filter, which Surah to fetch.
     */
    where?: SurahWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Surahs to fetch.
     */
    orderBy?: SurahOrderByWithRelationInput | SurahOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Surahs.
     */
    cursor?: SurahWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Surahs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Surahs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Surahs.
     */
    distinct?: SurahScalarFieldEnum | SurahScalarFieldEnum[]
  }

  /**
   * Surah findFirstOrThrow
   */
  export type SurahFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Surah
     */
    select?: SurahSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Surah
     */
    omit?: SurahOmit<ExtArgs> | null
    /**
     * Filter, which Surah to fetch.
     */
    where?: SurahWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Surahs to fetch.
     */
    orderBy?: SurahOrderByWithRelationInput | SurahOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Surahs.
     */
    cursor?: SurahWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Surahs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Surahs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Surahs.
     */
    distinct?: SurahScalarFieldEnum | SurahScalarFieldEnum[]
  }

  /**
   * Surah findMany
   */
  export type SurahFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Surah
     */
    select?: SurahSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Surah
     */
    omit?: SurahOmit<ExtArgs> | null
    /**
     * Filter, which Surahs to fetch.
     */
    where?: SurahWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Surahs to fetch.
     */
    orderBy?: SurahOrderByWithRelationInput | SurahOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Surahs.
     */
    cursor?: SurahWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Surahs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Surahs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Surahs.
     */
    distinct?: SurahScalarFieldEnum | SurahScalarFieldEnum[]
  }

  /**
   * Surah create
   */
  export type SurahCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Surah
     */
    select?: SurahSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Surah
     */
    omit?: SurahOmit<ExtArgs> | null
    /**
     * The data needed to create a Surah.
     */
    data: XOR<SurahCreateInput, SurahUncheckedCreateInput>
  }

  /**
   * Surah createMany
   */
  export type SurahCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Surahs.
     */
    data: SurahCreateManyInput | SurahCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Surah createManyAndReturn
   */
  export type SurahCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Surah
     */
    select?: SurahSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Surah
     */
    omit?: SurahOmit<ExtArgs> | null
    /**
     * The data used to create many Surahs.
     */
    data: SurahCreateManyInput | SurahCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Surah update
   */
  export type SurahUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Surah
     */
    select?: SurahSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Surah
     */
    omit?: SurahOmit<ExtArgs> | null
    /**
     * The data needed to update a Surah.
     */
    data: XOR<SurahUpdateInput, SurahUncheckedUpdateInput>
    /**
     * Choose, which Surah to update.
     */
    where: SurahWhereUniqueInput
  }

  /**
   * Surah updateMany
   */
  export type SurahUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Surahs.
     */
    data: XOR<SurahUpdateManyMutationInput, SurahUncheckedUpdateManyInput>
    /**
     * Filter which Surahs to update
     */
    where?: SurahWhereInput
    /**
     * Limit how many Surahs to update.
     */
    limit?: number
  }

  /**
   * Surah updateManyAndReturn
   */
  export type SurahUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Surah
     */
    select?: SurahSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Surah
     */
    omit?: SurahOmit<ExtArgs> | null
    /**
     * The data used to update Surahs.
     */
    data: XOR<SurahUpdateManyMutationInput, SurahUncheckedUpdateManyInput>
    /**
     * Filter which Surahs to update
     */
    where?: SurahWhereInput
    /**
     * Limit how many Surahs to update.
     */
    limit?: number
  }

  /**
   * Surah upsert
   */
  export type SurahUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Surah
     */
    select?: SurahSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Surah
     */
    omit?: SurahOmit<ExtArgs> | null
    /**
     * The filter to search for the Surah to update in case it exists.
     */
    where: SurahWhereUniqueInput
    /**
     * In case the Surah found by the `where` argument doesn't exist, create a new Surah with this data.
     */
    create: XOR<SurahCreateInput, SurahUncheckedCreateInput>
    /**
     * In case the Surah was found with the provided `where` argument, update it with this data.
     */
    update: XOR<SurahUpdateInput, SurahUncheckedUpdateInput>
  }

  /**
   * Surah delete
   */
  export type SurahDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Surah
     */
    select?: SurahSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Surah
     */
    omit?: SurahOmit<ExtArgs> | null
    /**
     * Filter which Surah to delete.
     */
    where: SurahWhereUniqueInput
  }

  /**
   * Surah deleteMany
   */
  export type SurahDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Surahs to delete
     */
    where?: SurahWhereInput
    /**
     * Limit how many Surahs to delete.
     */
    limit?: number
  }

  /**
   * Surah without action
   */
  export type SurahDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Surah
     */
    select?: SurahSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Surah
     */
    omit?: SurahOmit<ExtArgs> | null
  }


  /**
   * Model Verse
   */

  export type AggregateVerse = {
    _count: VerseCountAggregateOutputType | null
    _avg: VerseAvgAggregateOutputType | null
    _sum: VerseSumAggregateOutputType | null
    _min: VerseMinAggregateOutputType | null
    _max: VerseMaxAggregateOutputType | null
  }

  export type VerseAvgAggregateOutputType = {
    surahId: number | null
    ayahNumber: number | null
    pageNumber: number | null
  }

  export type VerseSumAggregateOutputType = {
    surahId: number | null
    ayahNumber: number | null
    pageNumber: number | null
  }

  export type VerseMinAggregateOutputType = {
    verseKey: string | null
    surahId: number | null
    ayahNumber: number | null
    pageNumber: number | null
    uthmaniText: string | null
    translation: string | null
    audioUrl: string | null
    timestampsJson: string | null
    wordsJson: string | null
    wordsSource: string | null
    recitationUrl: string | null
    tafsir: string | null
    createdAt: Date | null
  }

  export type VerseMaxAggregateOutputType = {
    verseKey: string | null
    surahId: number | null
    ayahNumber: number | null
    pageNumber: number | null
    uthmaniText: string | null
    translation: string | null
    audioUrl: string | null
    timestampsJson: string | null
    wordsJson: string | null
    wordsSource: string | null
    recitationUrl: string | null
    tafsir: string | null
    createdAt: Date | null
  }

  export type VerseCountAggregateOutputType = {
    verseKey: number
    surahId: number
    ayahNumber: number
    pageNumber: number
    uthmaniText: number
    translation: number
    audioUrl: number
    timestampsJson: number
    wordsJson: number
    wordsSource: number
    recitationUrl: number
    tafsir: number
    createdAt: number
    _all: number
  }


  export type VerseAvgAggregateInputType = {
    surahId?: true
    ayahNumber?: true
    pageNumber?: true
  }

  export type VerseSumAggregateInputType = {
    surahId?: true
    ayahNumber?: true
    pageNumber?: true
  }

  export type VerseMinAggregateInputType = {
    verseKey?: true
    surahId?: true
    ayahNumber?: true
    pageNumber?: true
    uthmaniText?: true
    translation?: true
    audioUrl?: true
    timestampsJson?: true
    wordsJson?: true
    wordsSource?: true
    recitationUrl?: true
    tafsir?: true
    createdAt?: true
  }

  export type VerseMaxAggregateInputType = {
    verseKey?: true
    surahId?: true
    ayahNumber?: true
    pageNumber?: true
    uthmaniText?: true
    translation?: true
    audioUrl?: true
    timestampsJson?: true
    wordsJson?: true
    wordsSource?: true
    recitationUrl?: true
    tafsir?: true
    createdAt?: true
  }

  export type VerseCountAggregateInputType = {
    verseKey?: true
    surahId?: true
    ayahNumber?: true
    pageNumber?: true
    uthmaniText?: true
    translation?: true
    audioUrl?: true
    timestampsJson?: true
    wordsJson?: true
    wordsSource?: true
    recitationUrl?: true
    tafsir?: true
    createdAt?: true
    _all?: true
  }

  export type VerseAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Verse to aggregate.
     */
    where?: VerseWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Verses to fetch.
     */
    orderBy?: VerseOrderByWithRelationInput | VerseOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: VerseWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Verses from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Verses.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Verses
    **/
    _count?: true | VerseCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: VerseAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: VerseSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: VerseMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: VerseMaxAggregateInputType
  }

  export type GetVerseAggregateType<T extends VerseAggregateArgs> = {
        [P in keyof T & keyof AggregateVerse]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateVerse[P]>
      : GetScalarType<T[P], AggregateVerse[P]>
  }




  export type VerseGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: VerseWhereInput
    orderBy?: VerseOrderByWithAggregationInput | VerseOrderByWithAggregationInput[]
    by: VerseScalarFieldEnum[] | VerseScalarFieldEnum
    having?: VerseScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: VerseCountAggregateInputType | true
    _avg?: VerseAvgAggregateInputType
    _sum?: VerseSumAggregateInputType
    _min?: VerseMinAggregateInputType
    _max?: VerseMaxAggregateInputType
  }

  export type VerseGroupByOutputType = {
    verseKey: string
    surahId: number
    ayahNumber: number
    pageNumber: number
    uthmaniText: string
    translation: string
    audioUrl: string
    timestampsJson: string
    wordsJson: string | null
    wordsSource: string
    recitationUrl: string | null
    tafsir: string | null
    createdAt: Date
    _count: VerseCountAggregateOutputType | null
    _avg: VerseAvgAggregateOutputType | null
    _sum: VerseSumAggregateOutputType | null
    _min: VerseMinAggregateOutputType | null
    _max: VerseMaxAggregateOutputType | null
  }

  type GetVerseGroupByPayload<T extends VerseGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<VerseGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof VerseGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], VerseGroupByOutputType[P]>
            : GetScalarType<T[P], VerseGroupByOutputType[P]>
        }
      >
    >


  export type VerseSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    verseKey?: boolean
    surahId?: boolean
    ayahNumber?: boolean
    pageNumber?: boolean
    uthmaniText?: boolean
    translation?: boolean
    audioUrl?: boolean
    timestampsJson?: boolean
    wordsJson?: boolean
    wordsSource?: boolean
    recitationUrl?: boolean
    tafsir?: boolean
    createdAt?: boolean
    memoryStates?: boolean | Verse$memoryStatesArgs<ExtArgs>
    reviewLogs?: boolean | Verse$reviewLogsArgs<ExtArgs>
    _count?: boolean | VerseCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["verse"]>

  export type VerseSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    verseKey?: boolean
    surahId?: boolean
    ayahNumber?: boolean
    pageNumber?: boolean
    uthmaniText?: boolean
    translation?: boolean
    audioUrl?: boolean
    timestampsJson?: boolean
    wordsJson?: boolean
    wordsSource?: boolean
    recitationUrl?: boolean
    tafsir?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["verse"]>

  export type VerseSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    verseKey?: boolean
    surahId?: boolean
    ayahNumber?: boolean
    pageNumber?: boolean
    uthmaniText?: boolean
    translation?: boolean
    audioUrl?: boolean
    timestampsJson?: boolean
    wordsJson?: boolean
    wordsSource?: boolean
    recitationUrl?: boolean
    tafsir?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["verse"]>

  export type VerseSelectScalar = {
    verseKey?: boolean
    surahId?: boolean
    ayahNumber?: boolean
    pageNumber?: boolean
    uthmaniText?: boolean
    translation?: boolean
    audioUrl?: boolean
    timestampsJson?: boolean
    wordsJson?: boolean
    wordsSource?: boolean
    recitationUrl?: boolean
    tafsir?: boolean
    createdAt?: boolean
  }

  export type VerseOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"verseKey" | "surahId" | "ayahNumber" | "pageNumber" | "uthmaniText" | "translation" | "audioUrl" | "timestampsJson" | "wordsJson" | "wordsSource" | "recitationUrl" | "tafsir" | "createdAt", ExtArgs["result"]["verse"]>
  export type VerseInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    memoryStates?: boolean | Verse$memoryStatesArgs<ExtArgs>
    reviewLogs?: boolean | Verse$reviewLogsArgs<ExtArgs>
    _count?: boolean | VerseCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type VerseIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type VerseIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $VersePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Verse"
    objects: {
      memoryStates: Prisma.$UserMemoryStatePayload<ExtArgs>[]
      reviewLogs: Prisma.$ReviewLogPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      verseKey: string
      surahId: number
      ayahNumber: number
      pageNumber: number
      uthmaniText: string
      translation: string
      audioUrl: string
      timestampsJson: string
      wordsJson: string | null
      wordsSource: string
      recitationUrl: string | null
      tafsir: string | null
      createdAt: Date
    }, ExtArgs["result"]["verse"]>
    composites: {}
  }

  type VerseGetPayload<S extends boolean | null | undefined | VerseDefaultArgs> = $Result.GetResult<Prisma.$VersePayload, S>

  type VerseCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<VerseFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: VerseCountAggregateInputType | true
    }

  export interface VerseDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Verse'], meta: { name: 'Verse' } }
    /**
     * Find zero or one Verse that matches the filter.
     * @param {VerseFindUniqueArgs} args - Arguments to find a Verse
     * @example
     * // Get one Verse
     * const verse = await prisma.verse.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends VerseFindUniqueArgs>(args: SelectSubset<T, VerseFindUniqueArgs<ExtArgs>>): Prisma__VerseClient<$Result.GetResult<Prisma.$VersePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Verse that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {VerseFindUniqueOrThrowArgs} args - Arguments to find a Verse
     * @example
     * // Get one Verse
     * const verse = await prisma.verse.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends VerseFindUniqueOrThrowArgs>(args: SelectSubset<T, VerseFindUniqueOrThrowArgs<ExtArgs>>): Prisma__VerseClient<$Result.GetResult<Prisma.$VersePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Verse that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VerseFindFirstArgs} args - Arguments to find a Verse
     * @example
     * // Get one Verse
     * const verse = await prisma.verse.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends VerseFindFirstArgs>(args?: SelectSubset<T, VerseFindFirstArgs<ExtArgs>>): Prisma__VerseClient<$Result.GetResult<Prisma.$VersePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Verse that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VerseFindFirstOrThrowArgs} args - Arguments to find a Verse
     * @example
     * // Get one Verse
     * const verse = await prisma.verse.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends VerseFindFirstOrThrowArgs>(args?: SelectSubset<T, VerseFindFirstOrThrowArgs<ExtArgs>>): Prisma__VerseClient<$Result.GetResult<Prisma.$VersePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Verses that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VerseFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Verses
     * const verses = await prisma.verse.findMany()
     * 
     * // Get first 10 Verses
     * const verses = await prisma.verse.findMany({ take: 10 })
     * 
     * // Only select the `verseKey`
     * const verseWithVerseKeyOnly = await prisma.verse.findMany({ select: { verseKey: true } })
     * 
     */
    findMany<T extends VerseFindManyArgs>(args?: SelectSubset<T, VerseFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$VersePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Verse.
     * @param {VerseCreateArgs} args - Arguments to create a Verse.
     * @example
     * // Create one Verse
     * const Verse = await prisma.verse.create({
     *   data: {
     *     // ... data to create a Verse
     *   }
     * })
     * 
     */
    create<T extends VerseCreateArgs>(args: SelectSubset<T, VerseCreateArgs<ExtArgs>>): Prisma__VerseClient<$Result.GetResult<Prisma.$VersePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Verses.
     * @param {VerseCreateManyArgs} args - Arguments to create many Verses.
     * @example
     * // Create many Verses
     * const verse = await prisma.verse.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends VerseCreateManyArgs>(args?: SelectSubset<T, VerseCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Verses and returns the data saved in the database.
     * @param {VerseCreateManyAndReturnArgs} args - Arguments to create many Verses.
     * @example
     * // Create many Verses
     * const verse = await prisma.verse.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Verses and only return the `verseKey`
     * const verseWithVerseKeyOnly = await prisma.verse.createManyAndReturn({
     *   select: { verseKey: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends VerseCreateManyAndReturnArgs>(args?: SelectSubset<T, VerseCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$VersePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Verse.
     * @param {VerseDeleteArgs} args - Arguments to delete one Verse.
     * @example
     * // Delete one Verse
     * const Verse = await prisma.verse.delete({
     *   where: {
     *     // ... filter to delete one Verse
     *   }
     * })
     * 
     */
    delete<T extends VerseDeleteArgs>(args: SelectSubset<T, VerseDeleteArgs<ExtArgs>>): Prisma__VerseClient<$Result.GetResult<Prisma.$VersePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Verse.
     * @param {VerseUpdateArgs} args - Arguments to update one Verse.
     * @example
     * // Update one Verse
     * const verse = await prisma.verse.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends VerseUpdateArgs>(args: SelectSubset<T, VerseUpdateArgs<ExtArgs>>): Prisma__VerseClient<$Result.GetResult<Prisma.$VersePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Verses.
     * @param {VerseDeleteManyArgs} args - Arguments to filter Verses to delete.
     * @example
     * // Delete a few Verses
     * const { count } = await prisma.verse.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends VerseDeleteManyArgs>(args?: SelectSubset<T, VerseDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Verses.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VerseUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Verses
     * const verse = await prisma.verse.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends VerseUpdateManyArgs>(args: SelectSubset<T, VerseUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Verses and returns the data updated in the database.
     * @param {VerseUpdateManyAndReturnArgs} args - Arguments to update many Verses.
     * @example
     * // Update many Verses
     * const verse = await prisma.verse.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Verses and only return the `verseKey`
     * const verseWithVerseKeyOnly = await prisma.verse.updateManyAndReturn({
     *   select: { verseKey: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends VerseUpdateManyAndReturnArgs>(args: SelectSubset<T, VerseUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$VersePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Verse.
     * @param {VerseUpsertArgs} args - Arguments to update or create a Verse.
     * @example
     * // Update or create a Verse
     * const verse = await prisma.verse.upsert({
     *   create: {
     *     // ... data to create a Verse
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Verse we want to update
     *   }
     * })
     */
    upsert<T extends VerseUpsertArgs>(args: SelectSubset<T, VerseUpsertArgs<ExtArgs>>): Prisma__VerseClient<$Result.GetResult<Prisma.$VersePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Verses.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VerseCountArgs} args - Arguments to filter Verses to count.
     * @example
     * // Count the number of Verses
     * const count = await prisma.verse.count({
     *   where: {
     *     // ... the filter for the Verses we want to count
     *   }
     * })
    **/
    count<T extends VerseCountArgs>(
      args?: Subset<T, VerseCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], VerseCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Verse.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VerseAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends VerseAggregateArgs>(args: Subset<T, VerseAggregateArgs>): Prisma.PrismaPromise<GetVerseAggregateType<T>>

    /**
     * Group by Verse.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VerseGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends VerseGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: VerseGroupByArgs['orderBy'] }
        : { orderBy?: VerseGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, VerseGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetVerseGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Verse model
   */
  readonly fields: VerseFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Verse.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__VerseClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    memoryStates<T extends Verse$memoryStatesArgs<ExtArgs> = {}>(args?: Subset<T, Verse$memoryStatesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserMemoryStatePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    reviewLogs<T extends Verse$reviewLogsArgs<ExtArgs> = {}>(args?: Subset<T, Verse$reviewLogsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ReviewLogPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Verse model
   */
  interface VerseFieldRefs {
    readonly verseKey: FieldRef<"Verse", 'String'>
    readonly surahId: FieldRef<"Verse", 'Int'>
    readonly ayahNumber: FieldRef<"Verse", 'Int'>
    readonly pageNumber: FieldRef<"Verse", 'Int'>
    readonly uthmaniText: FieldRef<"Verse", 'String'>
    readonly translation: FieldRef<"Verse", 'String'>
    readonly audioUrl: FieldRef<"Verse", 'String'>
    readonly timestampsJson: FieldRef<"Verse", 'String'>
    readonly wordsJson: FieldRef<"Verse", 'String'>
    readonly wordsSource: FieldRef<"Verse", 'String'>
    readonly recitationUrl: FieldRef<"Verse", 'String'>
    readonly tafsir: FieldRef<"Verse", 'String'>
    readonly createdAt: FieldRef<"Verse", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Verse findUnique
   */
  export type VerseFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Verse
     */
    select?: VerseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Verse
     */
    omit?: VerseOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VerseInclude<ExtArgs> | null
    /**
     * Filter, which Verse to fetch.
     */
    where: VerseWhereUniqueInput
  }

  /**
   * Verse findUniqueOrThrow
   */
  export type VerseFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Verse
     */
    select?: VerseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Verse
     */
    omit?: VerseOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VerseInclude<ExtArgs> | null
    /**
     * Filter, which Verse to fetch.
     */
    where: VerseWhereUniqueInput
  }

  /**
   * Verse findFirst
   */
  export type VerseFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Verse
     */
    select?: VerseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Verse
     */
    omit?: VerseOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VerseInclude<ExtArgs> | null
    /**
     * Filter, which Verse to fetch.
     */
    where?: VerseWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Verses to fetch.
     */
    orderBy?: VerseOrderByWithRelationInput | VerseOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Verses.
     */
    cursor?: VerseWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Verses from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Verses.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Verses.
     */
    distinct?: VerseScalarFieldEnum | VerseScalarFieldEnum[]
  }

  /**
   * Verse findFirstOrThrow
   */
  export type VerseFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Verse
     */
    select?: VerseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Verse
     */
    omit?: VerseOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VerseInclude<ExtArgs> | null
    /**
     * Filter, which Verse to fetch.
     */
    where?: VerseWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Verses to fetch.
     */
    orderBy?: VerseOrderByWithRelationInput | VerseOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Verses.
     */
    cursor?: VerseWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Verses from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Verses.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Verses.
     */
    distinct?: VerseScalarFieldEnum | VerseScalarFieldEnum[]
  }

  /**
   * Verse findMany
   */
  export type VerseFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Verse
     */
    select?: VerseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Verse
     */
    omit?: VerseOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VerseInclude<ExtArgs> | null
    /**
     * Filter, which Verses to fetch.
     */
    where?: VerseWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Verses to fetch.
     */
    orderBy?: VerseOrderByWithRelationInput | VerseOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Verses.
     */
    cursor?: VerseWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Verses from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Verses.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Verses.
     */
    distinct?: VerseScalarFieldEnum | VerseScalarFieldEnum[]
  }

  /**
   * Verse create
   */
  export type VerseCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Verse
     */
    select?: VerseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Verse
     */
    omit?: VerseOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VerseInclude<ExtArgs> | null
    /**
     * The data needed to create a Verse.
     */
    data: XOR<VerseCreateInput, VerseUncheckedCreateInput>
  }

  /**
   * Verse createMany
   */
  export type VerseCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Verses.
     */
    data: VerseCreateManyInput | VerseCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Verse createManyAndReturn
   */
  export type VerseCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Verse
     */
    select?: VerseSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Verse
     */
    omit?: VerseOmit<ExtArgs> | null
    /**
     * The data used to create many Verses.
     */
    data: VerseCreateManyInput | VerseCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Verse update
   */
  export type VerseUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Verse
     */
    select?: VerseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Verse
     */
    omit?: VerseOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VerseInclude<ExtArgs> | null
    /**
     * The data needed to update a Verse.
     */
    data: XOR<VerseUpdateInput, VerseUncheckedUpdateInput>
    /**
     * Choose, which Verse to update.
     */
    where: VerseWhereUniqueInput
  }

  /**
   * Verse updateMany
   */
  export type VerseUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Verses.
     */
    data: XOR<VerseUpdateManyMutationInput, VerseUncheckedUpdateManyInput>
    /**
     * Filter which Verses to update
     */
    where?: VerseWhereInput
    /**
     * Limit how many Verses to update.
     */
    limit?: number
  }

  /**
   * Verse updateManyAndReturn
   */
  export type VerseUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Verse
     */
    select?: VerseSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Verse
     */
    omit?: VerseOmit<ExtArgs> | null
    /**
     * The data used to update Verses.
     */
    data: XOR<VerseUpdateManyMutationInput, VerseUncheckedUpdateManyInput>
    /**
     * Filter which Verses to update
     */
    where?: VerseWhereInput
    /**
     * Limit how many Verses to update.
     */
    limit?: number
  }

  /**
   * Verse upsert
   */
  export type VerseUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Verse
     */
    select?: VerseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Verse
     */
    omit?: VerseOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VerseInclude<ExtArgs> | null
    /**
     * The filter to search for the Verse to update in case it exists.
     */
    where: VerseWhereUniqueInput
    /**
     * In case the Verse found by the `where` argument doesn't exist, create a new Verse with this data.
     */
    create: XOR<VerseCreateInput, VerseUncheckedCreateInput>
    /**
     * In case the Verse was found with the provided `where` argument, update it with this data.
     */
    update: XOR<VerseUpdateInput, VerseUncheckedUpdateInput>
  }

  /**
   * Verse delete
   */
  export type VerseDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Verse
     */
    select?: VerseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Verse
     */
    omit?: VerseOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VerseInclude<ExtArgs> | null
    /**
     * Filter which Verse to delete.
     */
    where: VerseWhereUniqueInput
  }

  /**
   * Verse deleteMany
   */
  export type VerseDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Verses to delete
     */
    where?: VerseWhereInput
    /**
     * Limit how many Verses to delete.
     */
    limit?: number
  }

  /**
   * Verse.memoryStates
   */
  export type Verse$memoryStatesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserMemoryState
     */
    select?: UserMemoryStateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserMemoryState
     */
    omit?: UserMemoryStateOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserMemoryStateInclude<ExtArgs> | null
    where?: UserMemoryStateWhereInput
    orderBy?: UserMemoryStateOrderByWithRelationInput | UserMemoryStateOrderByWithRelationInput[]
    cursor?: UserMemoryStateWhereUniqueInput
    take?: number
    skip?: number
    distinct?: UserMemoryStateScalarFieldEnum | UserMemoryStateScalarFieldEnum[]
  }

  /**
   * Verse.reviewLogs
   */
  export type Verse$reviewLogsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReviewLog
     */
    select?: ReviewLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReviewLog
     */
    omit?: ReviewLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReviewLogInclude<ExtArgs> | null
    where?: ReviewLogWhereInput
    orderBy?: ReviewLogOrderByWithRelationInput | ReviewLogOrderByWithRelationInput[]
    cursor?: ReviewLogWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ReviewLogScalarFieldEnum | ReviewLogScalarFieldEnum[]
  }

  /**
   * Verse without action
   */
  export type VerseDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Verse
     */
    select?: VerseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Verse
     */
    omit?: VerseOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VerseInclude<ExtArgs> | null
  }


  /**
   * Model UserMemoryState
   */

  export type AggregateUserMemoryState = {
    _count: UserMemoryStateCountAggregateOutputType | null
    _avg: UserMemoryStateAvgAggregateOutputType | null
    _sum: UserMemoryStateSumAggregateOutputType | null
    _min: UserMemoryStateMinAggregateOutputType | null
    _max: UserMemoryStateMaxAggregateOutputType | null
  }

  export type UserMemoryStateAvgAggregateOutputType = {
    intervalDays: number | null
    easeFactor: number | null
    repetitionCount: number | null
    lapses: number | null
    difficulty: number | null
    stability: number | null
  }

  export type UserMemoryStateSumAggregateOutputType = {
    intervalDays: number | null
    easeFactor: number | null
    repetitionCount: number | null
    lapses: number | null
    difficulty: number | null
    stability: number | null
  }

  export type UserMemoryStateMinAggregateOutputType = {
    id: string | null
    userId: string | null
    verseKey: string | null
    state: string | null
    intervalDays: number | null
    easeFactor: number | null
    repetitionCount: number | null
    lapses: number | null
    difficulty: number | null
    stability: number | null
    dueDate: Date | null
    lastReviewedAt: Date | null
  }

  export type UserMemoryStateMaxAggregateOutputType = {
    id: string | null
    userId: string | null
    verseKey: string | null
    state: string | null
    intervalDays: number | null
    easeFactor: number | null
    repetitionCount: number | null
    lapses: number | null
    difficulty: number | null
    stability: number | null
    dueDate: Date | null
    lastReviewedAt: Date | null
  }

  export type UserMemoryStateCountAggregateOutputType = {
    id: number
    userId: number
    verseKey: number
    state: number
    intervalDays: number
    easeFactor: number
    repetitionCount: number
    lapses: number
    difficulty: number
    stability: number
    dueDate: number
    lastReviewedAt: number
    _all: number
  }


  export type UserMemoryStateAvgAggregateInputType = {
    intervalDays?: true
    easeFactor?: true
    repetitionCount?: true
    lapses?: true
    difficulty?: true
    stability?: true
  }

  export type UserMemoryStateSumAggregateInputType = {
    intervalDays?: true
    easeFactor?: true
    repetitionCount?: true
    lapses?: true
    difficulty?: true
    stability?: true
  }

  export type UserMemoryStateMinAggregateInputType = {
    id?: true
    userId?: true
    verseKey?: true
    state?: true
    intervalDays?: true
    easeFactor?: true
    repetitionCount?: true
    lapses?: true
    difficulty?: true
    stability?: true
    dueDate?: true
    lastReviewedAt?: true
  }

  export type UserMemoryStateMaxAggregateInputType = {
    id?: true
    userId?: true
    verseKey?: true
    state?: true
    intervalDays?: true
    easeFactor?: true
    repetitionCount?: true
    lapses?: true
    difficulty?: true
    stability?: true
    dueDate?: true
    lastReviewedAt?: true
  }

  export type UserMemoryStateCountAggregateInputType = {
    id?: true
    userId?: true
    verseKey?: true
    state?: true
    intervalDays?: true
    easeFactor?: true
    repetitionCount?: true
    lapses?: true
    difficulty?: true
    stability?: true
    dueDate?: true
    lastReviewedAt?: true
    _all?: true
  }

  export type UserMemoryStateAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which UserMemoryState to aggregate.
     */
    where?: UserMemoryStateWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserMemoryStates to fetch.
     */
    orderBy?: UserMemoryStateOrderByWithRelationInput | UserMemoryStateOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UserMemoryStateWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserMemoryStates from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserMemoryStates.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned UserMemoryStates
    **/
    _count?: true | UserMemoryStateCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: UserMemoryStateAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: UserMemoryStateSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserMemoryStateMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserMemoryStateMaxAggregateInputType
  }

  export type GetUserMemoryStateAggregateType<T extends UserMemoryStateAggregateArgs> = {
        [P in keyof T & keyof AggregateUserMemoryState]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUserMemoryState[P]>
      : GetScalarType<T[P], AggregateUserMemoryState[P]>
  }




  export type UserMemoryStateGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserMemoryStateWhereInput
    orderBy?: UserMemoryStateOrderByWithAggregationInput | UserMemoryStateOrderByWithAggregationInput[]
    by: UserMemoryStateScalarFieldEnum[] | UserMemoryStateScalarFieldEnum
    having?: UserMemoryStateScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserMemoryStateCountAggregateInputType | true
    _avg?: UserMemoryStateAvgAggregateInputType
    _sum?: UserMemoryStateSumAggregateInputType
    _min?: UserMemoryStateMinAggregateInputType
    _max?: UserMemoryStateMaxAggregateInputType
  }

  export type UserMemoryStateGroupByOutputType = {
    id: string
    userId: string
    verseKey: string
    state: string
    intervalDays: number
    easeFactor: number
    repetitionCount: number
    lapses: number
    difficulty: number | null
    stability: number | null
    dueDate: Date
    lastReviewedAt: Date | null
    _count: UserMemoryStateCountAggregateOutputType | null
    _avg: UserMemoryStateAvgAggregateOutputType | null
    _sum: UserMemoryStateSumAggregateOutputType | null
    _min: UserMemoryStateMinAggregateOutputType | null
    _max: UserMemoryStateMaxAggregateOutputType | null
  }

  type GetUserMemoryStateGroupByPayload<T extends UserMemoryStateGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserMemoryStateGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserMemoryStateGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserMemoryStateGroupByOutputType[P]>
            : GetScalarType<T[P], UserMemoryStateGroupByOutputType[P]>
        }
      >
    >


  export type UserMemoryStateSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    verseKey?: boolean
    state?: boolean
    intervalDays?: boolean
    easeFactor?: boolean
    repetitionCount?: boolean
    lapses?: boolean
    difficulty?: boolean
    stability?: boolean
    dueDate?: boolean
    lastReviewedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
    verse?: boolean | VerseDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["userMemoryState"]>

  export type UserMemoryStateSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    verseKey?: boolean
    state?: boolean
    intervalDays?: boolean
    easeFactor?: boolean
    repetitionCount?: boolean
    lapses?: boolean
    difficulty?: boolean
    stability?: boolean
    dueDate?: boolean
    lastReviewedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
    verse?: boolean | VerseDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["userMemoryState"]>

  export type UserMemoryStateSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    verseKey?: boolean
    state?: boolean
    intervalDays?: boolean
    easeFactor?: boolean
    repetitionCount?: boolean
    lapses?: boolean
    difficulty?: boolean
    stability?: boolean
    dueDate?: boolean
    lastReviewedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
    verse?: boolean | VerseDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["userMemoryState"]>

  export type UserMemoryStateSelectScalar = {
    id?: boolean
    userId?: boolean
    verseKey?: boolean
    state?: boolean
    intervalDays?: boolean
    easeFactor?: boolean
    repetitionCount?: boolean
    lapses?: boolean
    difficulty?: boolean
    stability?: boolean
    dueDate?: boolean
    lastReviewedAt?: boolean
  }

  export type UserMemoryStateOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "userId" | "verseKey" | "state" | "intervalDays" | "easeFactor" | "repetitionCount" | "lapses" | "difficulty" | "stability" | "dueDate" | "lastReviewedAt", ExtArgs["result"]["userMemoryState"]>
  export type UserMemoryStateInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
    verse?: boolean | VerseDefaultArgs<ExtArgs>
  }
  export type UserMemoryStateIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
    verse?: boolean | VerseDefaultArgs<ExtArgs>
  }
  export type UserMemoryStateIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
    verse?: boolean | VerseDefaultArgs<ExtArgs>
  }

  export type $UserMemoryStatePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "UserMemoryState"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
      verse: Prisma.$VersePayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      userId: string
      verseKey: string
      state: string
      intervalDays: number
      easeFactor: number
      repetitionCount: number
      lapses: number
      difficulty: number | null
      stability: number | null
      dueDate: Date
      lastReviewedAt: Date | null
    }, ExtArgs["result"]["userMemoryState"]>
    composites: {}
  }

  type UserMemoryStateGetPayload<S extends boolean | null | undefined | UserMemoryStateDefaultArgs> = $Result.GetResult<Prisma.$UserMemoryStatePayload, S>

  type UserMemoryStateCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<UserMemoryStateFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: UserMemoryStateCountAggregateInputType | true
    }

  export interface UserMemoryStateDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['UserMemoryState'], meta: { name: 'UserMemoryState' } }
    /**
     * Find zero or one UserMemoryState that matches the filter.
     * @param {UserMemoryStateFindUniqueArgs} args - Arguments to find a UserMemoryState
     * @example
     * // Get one UserMemoryState
     * const userMemoryState = await prisma.userMemoryState.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserMemoryStateFindUniqueArgs>(args: SelectSubset<T, UserMemoryStateFindUniqueArgs<ExtArgs>>): Prisma__UserMemoryStateClient<$Result.GetResult<Prisma.$UserMemoryStatePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one UserMemoryState that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {UserMemoryStateFindUniqueOrThrowArgs} args - Arguments to find a UserMemoryState
     * @example
     * // Get one UserMemoryState
     * const userMemoryState = await prisma.userMemoryState.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserMemoryStateFindUniqueOrThrowArgs>(args: SelectSubset<T, UserMemoryStateFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UserMemoryStateClient<$Result.GetResult<Prisma.$UserMemoryStatePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first UserMemoryState that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserMemoryStateFindFirstArgs} args - Arguments to find a UserMemoryState
     * @example
     * // Get one UserMemoryState
     * const userMemoryState = await prisma.userMemoryState.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserMemoryStateFindFirstArgs>(args?: SelectSubset<T, UserMemoryStateFindFirstArgs<ExtArgs>>): Prisma__UserMemoryStateClient<$Result.GetResult<Prisma.$UserMemoryStatePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first UserMemoryState that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserMemoryStateFindFirstOrThrowArgs} args - Arguments to find a UserMemoryState
     * @example
     * // Get one UserMemoryState
     * const userMemoryState = await prisma.userMemoryState.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserMemoryStateFindFirstOrThrowArgs>(args?: SelectSubset<T, UserMemoryStateFindFirstOrThrowArgs<ExtArgs>>): Prisma__UserMemoryStateClient<$Result.GetResult<Prisma.$UserMemoryStatePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more UserMemoryStates that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserMemoryStateFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all UserMemoryStates
     * const userMemoryStates = await prisma.userMemoryState.findMany()
     * 
     * // Get first 10 UserMemoryStates
     * const userMemoryStates = await prisma.userMemoryState.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const userMemoryStateWithIdOnly = await prisma.userMemoryState.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends UserMemoryStateFindManyArgs>(args?: SelectSubset<T, UserMemoryStateFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserMemoryStatePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a UserMemoryState.
     * @param {UserMemoryStateCreateArgs} args - Arguments to create a UserMemoryState.
     * @example
     * // Create one UserMemoryState
     * const UserMemoryState = await prisma.userMemoryState.create({
     *   data: {
     *     // ... data to create a UserMemoryState
     *   }
     * })
     * 
     */
    create<T extends UserMemoryStateCreateArgs>(args: SelectSubset<T, UserMemoryStateCreateArgs<ExtArgs>>): Prisma__UserMemoryStateClient<$Result.GetResult<Prisma.$UserMemoryStatePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many UserMemoryStates.
     * @param {UserMemoryStateCreateManyArgs} args - Arguments to create many UserMemoryStates.
     * @example
     * // Create many UserMemoryStates
     * const userMemoryState = await prisma.userMemoryState.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UserMemoryStateCreateManyArgs>(args?: SelectSubset<T, UserMemoryStateCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many UserMemoryStates and returns the data saved in the database.
     * @param {UserMemoryStateCreateManyAndReturnArgs} args - Arguments to create many UserMemoryStates.
     * @example
     * // Create many UserMemoryStates
     * const userMemoryState = await prisma.userMemoryState.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many UserMemoryStates and only return the `id`
     * const userMemoryStateWithIdOnly = await prisma.userMemoryState.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends UserMemoryStateCreateManyAndReturnArgs>(args?: SelectSubset<T, UserMemoryStateCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserMemoryStatePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a UserMemoryState.
     * @param {UserMemoryStateDeleteArgs} args - Arguments to delete one UserMemoryState.
     * @example
     * // Delete one UserMemoryState
     * const UserMemoryState = await prisma.userMemoryState.delete({
     *   where: {
     *     // ... filter to delete one UserMemoryState
     *   }
     * })
     * 
     */
    delete<T extends UserMemoryStateDeleteArgs>(args: SelectSubset<T, UserMemoryStateDeleteArgs<ExtArgs>>): Prisma__UserMemoryStateClient<$Result.GetResult<Prisma.$UserMemoryStatePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one UserMemoryState.
     * @param {UserMemoryStateUpdateArgs} args - Arguments to update one UserMemoryState.
     * @example
     * // Update one UserMemoryState
     * const userMemoryState = await prisma.userMemoryState.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UserMemoryStateUpdateArgs>(args: SelectSubset<T, UserMemoryStateUpdateArgs<ExtArgs>>): Prisma__UserMemoryStateClient<$Result.GetResult<Prisma.$UserMemoryStatePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more UserMemoryStates.
     * @param {UserMemoryStateDeleteManyArgs} args - Arguments to filter UserMemoryStates to delete.
     * @example
     * // Delete a few UserMemoryStates
     * const { count } = await prisma.userMemoryState.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UserMemoryStateDeleteManyArgs>(args?: SelectSubset<T, UserMemoryStateDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more UserMemoryStates.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserMemoryStateUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many UserMemoryStates
     * const userMemoryState = await prisma.userMemoryState.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UserMemoryStateUpdateManyArgs>(args: SelectSubset<T, UserMemoryStateUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more UserMemoryStates and returns the data updated in the database.
     * @param {UserMemoryStateUpdateManyAndReturnArgs} args - Arguments to update many UserMemoryStates.
     * @example
     * // Update many UserMemoryStates
     * const userMemoryState = await prisma.userMemoryState.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more UserMemoryStates and only return the `id`
     * const userMemoryStateWithIdOnly = await prisma.userMemoryState.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends UserMemoryStateUpdateManyAndReturnArgs>(args: SelectSubset<T, UserMemoryStateUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserMemoryStatePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one UserMemoryState.
     * @param {UserMemoryStateUpsertArgs} args - Arguments to update or create a UserMemoryState.
     * @example
     * // Update or create a UserMemoryState
     * const userMemoryState = await prisma.userMemoryState.upsert({
     *   create: {
     *     // ... data to create a UserMemoryState
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the UserMemoryState we want to update
     *   }
     * })
     */
    upsert<T extends UserMemoryStateUpsertArgs>(args: SelectSubset<T, UserMemoryStateUpsertArgs<ExtArgs>>): Prisma__UserMemoryStateClient<$Result.GetResult<Prisma.$UserMemoryStatePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of UserMemoryStates.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserMemoryStateCountArgs} args - Arguments to filter UserMemoryStates to count.
     * @example
     * // Count the number of UserMemoryStates
     * const count = await prisma.userMemoryState.count({
     *   where: {
     *     // ... the filter for the UserMemoryStates we want to count
     *   }
     * })
    **/
    count<T extends UserMemoryStateCountArgs>(
      args?: Subset<T, UserMemoryStateCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserMemoryStateCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a UserMemoryState.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserMemoryStateAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UserMemoryStateAggregateArgs>(args: Subset<T, UserMemoryStateAggregateArgs>): Prisma.PrismaPromise<GetUserMemoryStateAggregateType<T>>

    /**
     * Group by UserMemoryState.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserMemoryStateGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends UserMemoryStateGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserMemoryStateGroupByArgs['orderBy'] }
        : { orderBy?: UserMemoryStateGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, UserMemoryStateGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserMemoryStateGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the UserMemoryState model
   */
  readonly fields: UserMemoryStateFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for UserMemoryState.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserMemoryStateClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    verse<T extends VerseDefaultArgs<ExtArgs> = {}>(args?: Subset<T, VerseDefaultArgs<ExtArgs>>): Prisma__VerseClient<$Result.GetResult<Prisma.$VersePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the UserMemoryState model
   */
  interface UserMemoryStateFieldRefs {
    readonly id: FieldRef<"UserMemoryState", 'String'>
    readonly userId: FieldRef<"UserMemoryState", 'String'>
    readonly verseKey: FieldRef<"UserMemoryState", 'String'>
    readonly state: FieldRef<"UserMemoryState", 'String'>
    readonly intervalDays: FieldRef<"UserMemoryState", 'Float'>
    readonly easeFactor: FieldRef<"UserMemoryState", 'Float'>
    readonly repetitionCount: FieldRef<"UserMemoryState", 'Int'>
    readonly lapses: FieldRef<"UserMemoryState", 'Int'>
    readonly difficulty: FieldRef<"UserMemoryState", 'Float'>
    readonly stability: FieldRef<"UserMemoryState", 'Float'>
    readonly dueDate: FieldRef<"UserMemoryState", 'DateTime'>
    readonly lastReviewedAt: FieldRef<"UserMemoryState", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * UserMemoryState findUnique
   */
  export type UserMemoryStateFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserMemoryState
     */
    select?: UserMemoryStateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserMemoryState
     */
    omit?: UserMemoryStateOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserMemoryStateInclude<ExtArgs> | null
    /**
     * Filter, which UserMemoryState to fetch.
     */
    where: UserMemoryStateWhereUniqueInput
  }

  /**
   * UserMemoryState findUniqueOrThrow
   */
  export type UserMemoryStateFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserMemoryState
     */
    select?: UserMemoryStateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserMemoryState
     */
    omit?: UserMemoryStateOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserMemoryStateInclude<ExtArgs> | null
    /**
     * Filter, which UserMemoryState to fetch.
     */
    where: UserMemoryStateWhereUniqueInput
  }

  /**
   * UserMemoryState findFirst
   */
  export type UserMemoryStateFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserMemoryState
     */
    select?: UserMemoryStateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserMemoryState
     */
    omit?: UserMemoryStateOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserMemoryStateInclude<ExtArgs> | null
    /**
     * Filter, which UserMemoryState to fetch.
     */
    where?: UserMemoryStateWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserMemoryStates to fetch.
     */
    orderBy?: UserMemoryStateOrderByWithRelationInput | UserMemoryStateOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for UserMemoryStates.
     */
    cursor?: UserMemoryStateWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserMemoryStates from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserMemoryStates.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of UserMemoryStates.
     */
    distinct?: UserMemoryStateScalarFieldEnum | UserMemoryStateScalarFieldEnum[]
  }

  /**
   * UserMemoryState findFirstOrThrow
   */
  export type UserMemoryStateFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserMemoryState
     */
    select?: UserMemoryStateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserMemoryState
     */
    omit?: UserMemoryStateOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserMemoryStateInclude<ExtArgs> | null
    /**
     * Filter, which UserMemoryState to fetch.
     */
    where?: UserMemoryStateWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserMemoryStates to fetch.
     */
    orderBy?: UserMemoryStateOrderByWithRelationInput | UserMemoryStateOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for UserMemoryStates.
     */
    cursor?: UserMemoryStateWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserMemoryStates from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserMemoryStates.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of UserMemoryStates.
     */
    distinct?: UserMemoryStateScalarFieldEnum | UserMemoryStateScalarFieldEnum[]
  }

  /**
   * UserMemoryState findMany
   */
  export type UserMemoryStateFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserMemoryState
     */
    select?: UserMemoryStateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserMemoryState
     */
    omit?: UserMemoryStateOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserMemoryStateInclude<ExtArgs> | null
    /**
     * Filter, which UserMemoryStates to fetch.
     */
    where?: UserMemoryStateWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserMemoryStates to fetch.
     */
    orderBy?: UserMemoryStateOrderByWithRelationInput | UserMemoryStateOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing UserMemoryStates.
     */
    cursor?: UserMemoryStateWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserMemoryStates from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserMemoryStates.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of UserMemoryStates.
     */
    distinct?: UserMemoryStateScalarFieldEnum | UserMemoryStateScalarFieldEnum[]
  }

  /**
   * UserMemoryState create
   */
  export type UserMemoryStateCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserMemoryState
     */
    select?: UserMemoryStateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserMemoryState
     */
    omit?: UserMemoryStateOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserMemoryStateInclude<ExtArgs> | null
    /**
     * The data needed to create a UserMemoryState.
     */
    data: XOR<UserMemoryStateCreateInput, UserMemoryStateUncheckedCreateInput>
  }

  /**
   * UserMemoryState createMany
   */
  export type UserMemoryStateCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many UserMemoryStates.
     */
    data: UserMemoryStateCreateManyInput | UserMemoryStateCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * UserMemoryState createManyAndReturn
   */
  export type UserMemoryStateCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserMemoryState
     */
    select?: UserMemoryStateSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the UserMemoryState
     */
    omit?: UserMemoryStateOmit<ExtArgs> | null
    /**
     * The data used to create many UserMemoryStates.
     */
    data: UserMemoryStateCreateManyInput | UserMemoryStateCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserMemoryStateIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * UserMemoryState update
   */
  export type UserMemoryStateUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserMemoryState
     */
    select?: UserMemoryStateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserMemoryState
     */
    omit?: UserMemoryStateOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserMemoryStateInclude<ExtArgs> | null
    /**
     * The data needed to update a UserMemoryState.
     */
    data: XOR<UserMemoryStateUpdateInput, UserMemoryStateUncheckedUpdateInput>
    /**
     * Choose, which UserMemoryState to update.
     */
    where: UserMemoryStateWhereUniqueInput
  }

  /**
   * UserMemoryState updateMany
   */
  export type UserMemoryStateUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update UserMemoryStates.
     */
    data: XOR<UserMemoryStateUpdateManyMutationInput, UserMemoryStateUncheckedUpdateManyInput>
    /**
     * Filter which UserMemoryStates to update
     */
    where?: UserMemoryStateWhereInput
    /**
     * Limit how many UserMemoryStates to update.
     */
    limit?: number
  }

  /**
   * UserMemoryState updateManyAndReturn
   */
  export type UserMemoryStateUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserMemoryState
     */
    select?: UserMemoryStateSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the UserMemoryState
     */
    omit?: UserMemoryStateOmit<ExtArgs> | null
    /**
     * The data used to update UserMemoryStates.
     */
    data: XOR<UserMemoryStateUpdateManyMutationInput, UserMemoryStateUncheckedUpdateManyInput>
    /**
     * Filter which UserMemoryStates to update
     */
    where?: UserMemoryStateWhereInput
    /**
     * Limit how many UserMemoryStates to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserMemoryStateIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * UserMemoryState upsert
   */
  export type UserMemoryStateUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserMemoryState
     */
    select?: UserMemoryStateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserMemoryState
     */
    omit?: UserMemoryStateOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserMemoryStateInclude<ExtArgs> | null
    /**
     * The filter to search for the UserMemoryState to update in case it exists.
     */
    where: UserMemoryStateWhereUniqueInput
    /**
     * In case the UserMemoryState found by the `where` argument doesn't exist, create a new UserMemoryState with this data.
     */
    create: XOR<UserMemoryStateCreateInput, UserMemoryStateUncheckedCreateInput>
    /**
     * In case the UserMemoryState was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserMemoryStateUpdateInput, UserMemoryStateUncheckedUpdateInput>
  }

  /**
   * UserMemoryState delete
   */
  export type UserMemoryStateDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserMemoryState
     */
    select?: UserMemoryStateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserMemoryState
     */
    omit?: UserMemoryStateOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserMemoryStateInclude<ExtArgs> | null
    /**
     * Filter which UserMemoryState to delete.
     */
    where: UserMemoryStateWhereUniqueInput
  }

  /**
   * UserMemoryState deleteMany
   */
  export type UserMemoryStateDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which UserMemoryStates to delete
     */
    where?: UserMemoryStateWhereInput
    /**
     * Limit how many UserMemoryStates to delete.
     */
    limit?: number
  }

  /**
   * UserMemoryState without action
   */
  export type UserMemoryStateDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserMemoryState
     */
    select?: UserMemoryStateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserMemoryState
     */
    omit?: UserMemoryStateOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserMemoryStateInclude<ExtArgs> | null
  }


  /**
   * Model RecitationAudio
   */

  export type AggregateRecitationAudio = {
    _count: RecitationAudioCountAggregateOutputType | null
    _avg: RecitationAudioAvgAggregateOutputType | null
    _sum: RecitationAudioSumAggregateOutputType | null
    _min: RecitationAudioMinAggregateOutputType | null
    _max: RecitationAudioMaxAggregateOutputType | null
  }

  export type RecitationAudioAvgAggregateOutputType = {
    reciterId: number | null
  }

  export type RecitationAudioSumAggregateOutputType = {
    reciterId: number | null
  }

  export type RecitationAudioMinAggregateOutputType = {
    id: string | null
    verseKey: string | null
    reciterId: number | null
    url: string | null
  }

  export type RecitationAudioMaxAggregateOutputType = {
    id: string | null
    verseKey: string | null
    reciterId: number | null
    url: string | null
  }

  export type RecitationAudioCountAggregateOutputType = {
    id: number
    verseKey: number
    reciterId: number
    url: number
    _all: number
  }


  export type RecitationAudioAvgAggregateInputType = {
    reciterId?: true
  }

  export type RecitationAudioSumAggregateInputType = {
    reciterId?: true
  }

  export type RecitationAudioMinAggregateInputType = {
    id?: true
    verseKey?: true
    reciterId?: true
    url?: true
  }

  export type RecitationAudioMaxAggregateInputType = {
    id?: true
    verseKey?: true
    reciterId?: true
    url?: true
  }

  export type RecitationAudioCountAggregateInputType = {
    id?: true
    verseKey?: true
    reciterId?: true
    url?: true
    _all?: true
  }

  export type RecitationAudioAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which RecitationAudio to aggregate.
     */
    where?: RecitationAudioWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RecitationAudios to fetch.
     */
    orderBy?: RecitationAudioOrderByWithRelationInput | RecitationAudioOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: RecitationAudioWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RecitationAudios from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RecitationAudios.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned RecitationAudios
    **/
    _count?: true | RecitationAudioCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: RecitationAudioAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: RecitationAudioSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: RecitationAudioMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: RecitationAudioMaxAggregateInputType
  }

  export type GetRecitationAudioAggregateType<T extends RecitationAudioAggregateArgs> = {
        [P in keyof T & keyof AggregateRecitationAudio]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateRecitationAudio[P]>
      : GetScalarType<T[P], AggregateRecitationAudio[P]>
  }




  export type RecitationAudioGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: RecitationAudioWhereInput
    orderBy?: RecitationAudioOrderByWithAggregationInput | RecitationAudioOrderByWithAggregationInput[]
    by: RecitationAudioScalarFieldEnum[] | RecitationAudioScalarFieldEnum
    having?: RecitationAudioScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: RecitationAudioCountAggregateInputType | true
    _avg?: RecitationAudioAvgAggregateInputType
    _sum?: RecitationAudioSumAggregateInputType
    _min?: RecitationAudioMinAggregateInputType
    _max?: RecitationAudioMaxAggregateInputType
  }

  export type RecitationAudioGroupByOutputType = {
    id: string
    verseKey: string
    reciterId: number
    url: string
    _count: RecitationAudioCountAggregateOutputType | null
    _avg: RecitationAudioAvgAggregateOutputType | null
    _sum: RecitationAudioSumAggregateOutputType | null
    _min: RecitationAudioMinAggregateOutputType | null
    _max: RecitationAudioMaxAggregateOutputType | null
  }

  type GetRecitationAudioGroupByPayload<T extends RecitationAudioGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<RecitationAudioGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof RecitationAudioGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], RecitationAudioGroupByOutputType[P]>
            : GetScalarType<T[P], RecitationAudioGroupByOutputType[P]>
        }
      >
    >


  export type RecitationAudioSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    verseKey?: boolean
    reciterId?: boolean
    url?: boolean
  }, ExtArgs["result"]["recitationAudio"]>

  export type RecitationAudioSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    verseKey?: boolean
    reciterId?: boolean
    url?: boolean
  }, ExtArgs["result"]["recitationAudio"]>

  export type RecitationAudioSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    verseKey?: boolean
    reciterId?: boolean
    url?: boolean
  }, ExtArgs["result"]["recitationAudio"]>

  export type RecitationAudioSelectScalar = {
    id?: boolean
    verseKey?: boolean
    reciterId?: boolean
    url?: boolean
  }

  export type RecitationAudioOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "verseKey" | "reciterId" | "url", ExtArgs["result"]["recitationAudio"]>

  export type $RecitationAudioPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "RecitationAudio"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      verseKey: string
      reciterId: number
      url: string
    }, ExtArgs["result"]["recitationAudio"]>
    composites: {}
  }

  type RecitationAudioGetPayload<S extends boolean | null | undefined | RecitationAudioDefaultArgs> = $Result.GetResult<Prisma.$RecitationAudioPayload, S>

  type RecitationAudioCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<RecitationAudioFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: RecitationAudioCountAggregateInputType | true
    }

  export interface RecitationAudioDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['RecitationAudio'], meta: { name: 'RecitationAudio' } }
    /**
     * Find zero or one RecitationAudio that matches the filter.
     * @param {RecitationAudioFindUniqueArgs} args - Arguments to find a RecitationAudio
     * @example
     * // Get one RecitationAudio
     * const recitationAudio = await prisma.recitationAudio.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends RecitationAudioFindUniqueArgs>(args: SelectSubset<T, RecitationAudioFindUniqueArgs<ExtArgs>>): Prisma__RecitationAudioClient<$Result.GetResult<Prisma.$RecitationAudioPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one RecitationAudio that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {RecitationAudioFindUniqueOrThrowArgs} args - Arguments to find a RecitationAudio
     * @example
     * // Get one RecitationAudio
     * const recitationAudio = await prisma.recitationAudio.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends RecitationAudioFindUniqueOrThrowArgs>(args: SelectSubset<T, RecitationAudioFindUniqueOrThrowArgs<ExtArgs>>): Prisma__RecitationAudioClient<$Result.GetResult<Prisma.$RecitationAudioPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first RecitationAudio that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RecitationAudioFindFirstArgs} args - Arguments to find a RecitationAudio
     * @example
     * // Get one RecitationAudio
     * const recitationAudio = await prisma.recitationAudio.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends RecitationAudioFindFirstArgs>(args?: SelectSubset<T, RecitationAudioFindFirstArgs<ExtArgs>>): Prisma__RecitationAudioClient<$Result.GetResult<Prisma.$RecitationAudioPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first RecitationAudio that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RecitationAudioFindFirstOrThrowArgs} args - Arguments to find a RecitationAudio
     * @example
     * // Get one RecitationAudio
     * const recitationAudio = await prisma.recitationAudio.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends RecitationAudioFindFirstOrThrowArgs>(args?: SelectSubset<T, RecitationAudioFindFirstOrThrowArgs<ExtArgs>>): Prisma__RecitationAudioClient<$Result.GetResult<Prisma.$RecitationAudioPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more RecitationAudios that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RecitationAudioFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all RecitationAudios
     * const recitationAudios = await prisma.recitationAudio.findMany()
     * 
     * // Get first 10 RecitationAudios
     * const recitationAudios = await prisma.recitationAudio.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const recitationAudioWithIdOnly = await prisma.recitationAudio.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends RecitationAudioFindManyArgs>(args?: SelectSubset<T, RecitationAudioFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RecitationAudioPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a RecitationAudio.
     * @param {RecitationAudioCreateArgs} args - Arguments to create a RecitationAudio.
     * @example
     * // Create one RecitationAudio
     * const RecitationAudio = await prisma.recitationAudio.create({
     *   data: {
     *     // ... data to create a RecitationAudio
     *   }
     * })
     * 
     */
    create<T extends RecitationAudioCreateArgs>(args: SelectSubset<T, RecitationAudioCreateArgs<ExtArgs>>): Prisma__RecitationAudioClient<$Result.GetResult<Prisma.$RecitationAudioPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many RecitationAudios.
     * @param {RecitationAudioCreateManyArgs} args - Arguments to create many RecitationAudios.
     * @example
     * // Create many RecitationAudios
     * const recitationAudio = await prisma.recitationAudio.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends RecitationAudioCreateManyArgs>(args?: SelectSubset<T, RecitationAudioCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many RecitationAudios and returns the data saved in the database.
     * @param {RecitationAudioCreateManyAndReturnArgs} args - Arguments to create many RecitationAudios.
     * @example
     * // Create many RecitationAudios
     * const recitationAudio = await prisma.recitationAudio.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many RecitationAudios and only return the `id`
     * const recitationAudioWithIdOnly = await prisma.recitationAudio.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends RecitationAudioCreateManyAndReturnArgs>(args?: SelectSubset<T, RecitationAudioCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RecitationAudioPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a RecitationAudio.
     * @param {RecitationAudioDeleteArgs} args - Arguments to delete one RecitationAudio.
     * @example
     * // Delete one RecitationAudio
     * const RecitationAudio = await prisma.recitationAudio.delete({
     *   where: {
     *     // ... filter to delete one RecitationAudio
     *   }
     * })
     * 
     */
    delete<T extends RecitationAudioDeleteArgs>(args: SelectSubset<T, RecitationAudioDeleteArgs<ExtArgs>>): Prisma__RecitationAudioClient<$Result.GetResult<Prisma.$RecitationAudioPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one RecitationAudio.
     * @param {RecitationAudioUpdateArgs} args - Arguments to update one RecitationAudio.
     * @example
     * // Update one RecitationAudio
     * const recitationAudio = await prisma.recitationAudio.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends RecitationAudioUpdateArgs>(args: SelectSubset<T, RecitationAudioUpdateArgs<ExtArgs>>): Prisma__RecitationAudioClient<$Result.GetResult<Prisma.$RecitationAudioPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more RecitationAudios.
     * @param {RecitationAudioDeleteManyArgs} args - Arguments to filter RecitationAudios to delete.
     * @example
     * // Delete a few RecitationAudios
     * const { count } = await prisma.recitationAudio.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends RecitationAudioDeleteManyArgs>(args?: SelectSubset<T, RecitationAudioDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more RecitationAudios.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RecitationAudioUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many RecitationAudios
     * const recitationAudio = await prisma.recitationAudio.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends RecitationAudioUpdateManyArgs>(args: SelectSubset<T, RecitationAudioUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more RecitationAudios and returns the data updated in the database.
     * @param {RecitationAudioUpdateManyAndReturnArgs} args - Arguments to update many RecitationAudios.
     * @example
     * // Update many RecitationAudios
     * const recitationAudio = await prisma.recitationAudio.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more RecitationAudios and only return the `id`
     * const recitationAudioWithIdOnly = await prisma.recitationAudio.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends RecitationAudioUpdateManyAndReturnArgs>(args: SelectSubset<T, RecitationAudioUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RecitationAudioPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one RecitationAudio.
     * @param {RecitationAudioUpsertArgs} args - Arguments to update or create a RecitationAudio.
     * @example
     * // Update or create a RecitationAudio
     * const recitationAudio = await prisma.recitationAudio.upsert({
     *   create: {
     *     // ... data to create a RecitationAudio
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the RecitationAudio we want to update
     *   }
     * })
     */
    upsert<T extends RecitationAudioUpsertArgs>(args: SelectSubset<T, RecitationAudioUpsertArgs<ExtArgs>>): Prisma__RecitationAudioClient<$Result.GetResult<Prisma.$RecitationAudioPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of RecitationAudios.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RecitationAudioCountArgs} args - Arguments to filter RecitationAudios to count.
     * @example
     * // Count the number of RecitationAudios
     * const count = await prisma.recitationAudio.count({
     *   where: {
     *     // ... the filter for the RecitationAudios we want to count
     *   }
     * })
    **/
    count<T extends RecitationAudioCountArgs>(
      args?: Subset<T, RecitationAudioCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], RecitationAudioCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a RecitationAudio.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RecitationAudioAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends RecitationAudioAggregateArgs>(args: Subset<T, RecitationAudioAggregateArgs>): Prisma.PrismaPromise<GetRecitationAudioAggregateType<T>>

    /**
     * Group by RecitationAudio.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RecitationAudioGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends RecitationAudioGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: RecitationAudioGroupByArgs['orderBy'] }
        : { orderBy?: RecitationAudioGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, RecitationAudioGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetRecitationAudioGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the RecitationAudio model
   */
  readonly fields: RecitationAudioFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for RecitationAudio.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__RecitationAudioClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the RecitationAudio model
   */
  interface RecitationAudioFieldRefs {
    readonly id: FieldRef<"RecitationAudio", 'String'>
    readonly verseKey: FieldRef<"RecitationAudio", 'String'>
    readonly reciterId: FieldRef<"RecitationAudio", 'Int'>
    readonly url: FieldRef<"RecitationAudio", 'String'>
  }
    

  // Custom InputTypes
  /**
   * RecitationAudio findUnique
   */
  export type RecitationAudioFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RecitationAudio
     */
    select?: RecitationAudioSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RecitationAudio
     */
    omit?: RecitationAudioOmit<ExtArgs> | null
    /**
     * Filter, which RecitationAudio to fetch.
     */
    where: RecitationAudioWhereUniqueInput
  }

  /**
   * RecitationAudio findUniqueOrThrow
   */
  export type RecitationAudioFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RecitationAudio
     */
    select?: RecitationAudioSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RecitationAudio
     */
    omit?: RecitationAudioOmit<ExtArgs> | null
    /**
     * Filter, which RecitationAudio to fetch.
     */
    where: RecitationAudioWhereUniqueInput
  }

  /**
   * RecitationAudio findFirst
   */
  export type RecitationAudioFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RecitationAudio
     */
    select?: RecitationAudioSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RecitationAudio
     */
    omit?: RecitationAudioOmit<ExtArgs> | null
    /**
     * Filter, which RecitationAudio to fetch.
     */
    where?: RecitationAudioWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RecitationAudios to fetch.
     */
    orderBy?: RecitationAudioOrderByWithRelationInput | RecitationAudioOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for RecitationAudios.
     */
    cursor?: RecitationAudioWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RecitationAudios from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RecitationAudios.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of RecitationAudios.
     */
    distinct?: RecitationAudioScalarFieldEnum | RecitationAudioScalarFieldEnum[]
  }

  /**
   * RecitationAudio findFirstOrThrow
   */
  export type RecitationAudioFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RecitationAudio
     */
    select?: RecitationAudioSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RecitationAudio
     */
    omit?: RecitationAudioOmit<ExtArgs> | null
    /**
     * Filter, which RecitationAudio to fetch.
     */
    where?: RecitationAudioWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RecitationAudios to fetch.
     */
    orderBy?: RecitationAudioOrderByWithRelationInput | RecitationAudioOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for RecitationAudios.
     */
    cursor?: RecitationAudioWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RecitationAudios from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RecitationAudios.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of RecitationAudios.
     */
    distinct?: RecitationAudioScalarFieldEnum | RecitationAudioScalarFieldEnum[]
  }

  /**
   * RecitationAudio findMany
   */
  export type RecitationAudioFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RecitationAudio
     */
    select?: RecitationAudioSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RecitationAudio
     */
    omit?: RecitationAudioOmit<ExtArgs> | null
    /**
     * Filter, which RecitationAudios to fetch.
     */
    where?: RecitationAudioWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RecitationAudios to fetch.
     */
    orderBy?: RecitationAudioOrderByWithRelationInput | RecitationAudioOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing RecitationAudios.
     */
    cursor?: RecitationAudioWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RecitationAudios from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RecitationAudios.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of RecitationAudios.
     */
    distinct?: RecitationAudioScalarFieldEnum | RecitationAudioScalarFieldEnum[]
  }

  /**
   * RecitationAudio create
   */
  export type RecitationAudioCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RecitationAudio
     */
    select?: RecitationAudioSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RecitationAudio
     */
    omit?: RecitationAudioOmit<ExtArgs> | null
    /**
     * The data needed to create a RecitationAudio.
     */
    data: XOR<RecitationAudioCreateInput, RecitationAudioUncheckedCreateInput>
  }

  /**
   * RecitationAudio createMany
   */
  export type RecitationAudioCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many RecitationAudios.
     */
    data: RecitationAudioCreateManyInput | RecitationAudioCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * RecitationAudio createManyAndReturn
   */
  export type RecitationAudioCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RecitationAudio
     */
    select?: RecitationAudioSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the RecitationAudio
     */
    omit?: RecitationAudioOmit<ExtArgs> | null
    /**
     * The data used to create many RecitationAudios.
     */
    data: RecitationAudioCreateManyInput | RecitationAudioCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * RecitationAudio update
   */
  export type RecitationAudioUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RecitationAudio
     */
    select?: RecitationAudioSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RecitationAudio
     */
    omit?: RecitationAudioOmit<ExtArgs> | null
    /**
     * The data needed to update a RecitationAudio.
     */
    data: XOR<RecitationAudioUpdateInput, RecitationAudioUncheckedUpdateInput>
    /**
     * Choose, which RecitationAudio to update.
     */
    where: RecitationAudioWhereUniqueInput
  }

  /**
   * RecitationAudio updateMany
   */
  export type RecitationAudioUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update RecitationAudios.
     */
    data: XOR<RecitationAudioUpdateManyMutationInput, RecitationAudioUncheckedUpdateManyInput>
    /**
     * Filter which RecitationAudios to update
     */
    where?: RecitationAudioWhereInput
    /**
     * Limit how many RecitationAudios to update.
     */
    limit?: number
  }

  /**
   * RecitationAudio updateManyAndReturn
   */
  export type RecitationAudioUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RecitationAudio
     */
    select?: RecitationAudioSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the RecitationAudio
     */
    omit?: RecitationAudioOmit<ExtArgs> | null
    /**
     * The data used to update RecitationAudios.
     */
    data: XOR<RecitationAudioUpdateManyMutationInput, RecitationAudioUncheckedUpdateManyInput>
    /**
     * Filter which RecitationAudios to update
     */
    where?: RecitationAudioWhereInput
    /**
     * Limit how many RecitationAudios to update.
     */
    limit?: number
  }

  /**
   * RecitationAudio upsert
   */
  export type RecitationAudioUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RecitationAudio
     */
    select?: RecitationAudioSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RecitationAudio
     */
    omit?: RecitationAudioOmit<ExtArgs> | null
    /**
     * The filter to search for the RecitationAudio to update in case it exists.
     */
    where: RecitationAudioWhereUniqueInput
    /**
     * In case the RecitationAudio found by the `where` argument doesn't exist, create a new RecitationAudio with this data.
     */
    create: XOR<RecitationAudioCreateInput, RecitationAudioUncheckedCreateInput>
    /**
     * In case the RecitationAudio was found with the provided `where` argument, update it with this data.
     */
    update: XOR<RecitationAudioUpdateInput, RecitationAudioUncheckedUpdateInput>
  }

  /**
   * RecitationAudio delete
   */
  export type RecitationAudioDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RecitationAudio
     */
    select?: RecitationAudioSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RecitationAudio
     */
    omit?: RecitationAudioOmit<ExtArgs> | null
    /**
     * Filter which RecitationAudio to delete.
     */
    where: RecitationAudioWhereUniqueInput
  }

  /**
   * RecitationAudio deleteMany
   */
  export type RecitationAudioDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which RecitationAudios to delete
     */
    where?: RecitationAudioWhereInput
    /**
     * Limit how many RecitationAudios to delete.
     */
    limit?: number
  }

  /**
   * RecitationAudio without action
   */
  export type RecitationAudioDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RecitationAudio
     */
    select?: RecitationAudioSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RecitationAudio
     */
    omit?: RecitationAudioOmit<ExtArgs> | null
  }


  /**
   * Model ReviewLog
   */

  export type AggregateReviewLog = {
    _count: ReviewLogCountAggregateOutputType | null
    _avg: ReviewLogAvgAggregateOutputType | null
    _sum: ReviewLogSumAggregateOutputType | null
    _min: ReviewLogMinAggregateOutputType | null
    _max: ReviewLogMaxAggregateOutputType | null
  }

  export type ReviewLogAvgAggregateOutputType = {
    quality: number | null
    intervalDays: number | null
    easeFactorAfter: number | null
    difficultyAfter: number | null
    stabilityAfter: number | null
    reviewDurationMs: number | null
  }

  export type ReviewLogSumAggregateOutputType = {
    quality: number | null
    intervalDays: number | null
    easeFactorAfter: number | null
    difficultyAfter: number | null
    stabilityAfter: number | null
    reviewDurationMs: number | null
  }

  export type ReviewLogMinAggregateOutputType = {
    id: string | null
    userId: string | null
    verseKey: string | null
    grade: string | null
    quality: number | null
    intervalDays: number | null
    easeFactorAfter: number | null
    difficultyAfter: number | null
    stabilityAfter: number | null
    scheduler: string | null
    reviewDurationMs: number | null
    createdAt: Date | null
  }

  export type ReviewLogMaxAggregateOutputType = {
    id: string | null
    userId: string | null
    verseKey: string | null
    grade: string | null
    quality: number | null
    intervalDays: number | null
    easeFactorAfter: number | null
    difficultyAfter: number | null
    stabilityAfter: number | null
    scheduler: string | null
    reviewDurationMs: number | null
    createdAt: Date | null
  }

  export type ReviewLogCountAggregateOutputType = {
    id: number
    userId: number
    verseKey: number
    grade: number
    quality: number
    intervalDays: number
    easeFactorAfter: number
    difficultyAfter: number
    stabilityAfter: number
    scheduler: number
    reviewDurationMs: number
    createdAt: number
    _all: number
  }


  export type ReviewLogAvgAggregateInputType = {
    quality?: true
    intervalDays?: true
    easeFactorAfter?: true
    difficultyAfter?: true
    stabilityAfter?: true
    reviewDurationMs?: true
  }

  export type ReviewLogSumAggregateInputType = {
    quality?: true
    intervalDays?: true
    easeFactorAfter?: true
    difficultyAfter?: true
    stabilityAfter?: true
    reviewDurationMs?: true
  }

  export type ReviewLogMinAggregateInputType = {
    id?: true
    userId?: true
    verseKey?: true
    grade?: true
    quality?: true
    intervalDays?: true
    easeFactorAfter?: true
    difficultyAfter?: true
    stabilityAfter?: true
    scheduler?: true
    reviewDurationMs?: true
    createdAt?: true
  }

  export type ReviewLogMaxAggregateInputType = {
    id?: true
    userId?: true
    verseKey?: true
    grade?: true
    quality?: true
    intervalDays?: true
    easeFactorAfter?: true
    difficultyAfter?: true
    stabilityAfter?: true
    scheduler?: true
    reviewDurationMs?: true
    createdAt?: true
  }

  export type ReviewLogCountAggregateInputType = {
    id?: true
    userId?: true
    verseKey?: true
    grade?: true
    quality?: true
    intervalDays?: true
    easeFactorAfter?: true
    difficultyAfter?: true
    stabilityAfter?: true
    scheduler?: true
    reviewDurationMs?: true
    createdAt?: true
    _all?: true
  }

  export type ReviewLogAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ReviewLog to aggregate.
     */
    where?: ReviewLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ReviewLogs to fetch.
     */
    orderBy?: ReviewLogOrderByWithRelationInput | ReviewLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ReviewLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ReviewLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ReviewLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ReviewLogs
    **/
    _count?: true | ReviewLogCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ReviewLogAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ReviewLogSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ReviewLogMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ReviewLogMaxAggregateInputType
  }

  export type GetReviewLogAggregateType<T extends ReviewLogAggregateArgs> = {
        [P in keyof T & keyof AggregateReviewLog]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateReviewLog[P]>
      : GetScalarType<T[P], AggregateReviewLog[P]>
  }




  export type ReviewLogGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ReviewLogWhereInput
    orderBy?: ReviewLogOrderByWithAggregationInput | ReviewLogOrderByWithAggregationInput[]
    by: ReviewLogScalarFieldEnum[] | ReviewLogScalarFieldEnum
    having?: ReviewLogScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ReviewLogCountAggregateInputType | true
    _avg?: ReviewLogAvgAggregateInputType
    _sum?: ReviewLogSumAggregateInputType
    _min?: ReviewLogMinAggregateInputType
    _max?: ReviewLogMaxAggregateInputType
  }

  export type ReviewLogGroupByOutputType = {
    id: string
    userId: string
    verseKey: string
    grade: string
    quality: number
    intervalDays: number
    easeFactorAfter: number
    difficultyAfter: number | null
    stabilityAfter: number | null
    scheduler: string
    reviewDurationMs: number
    createdAt: Date
    _count: ReviewLogCountAggregateOutputType | null
    _avg: ReviewLogAvgAggregateOutputType | null
    _sum: ReviewLogSumAggregateOutputType | null
    _min: ReviewLogMinAggregateOutputType | null
    _max: ReviewLogMaxAggregateOutputType | null
  }

  type GetReviewLogGroupByPayload<T extends ReviewLogGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ReviewLogGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ReviewLogGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ReviewLogGroupByOutputType[P]>
            : GetScalarType<T[P], ReviewLogGroupByOutputType[P]>
        }
      >
    >


  export type ReviewLogSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    verseKey?: boolean
    grade?: boolean
    quality?: boolean
    intervalDays?: boolean
    easeFactorAfter?: boolean
    difficultyAfter?: boolean
    stabilityAfter?: boolean
    scheduler?: boolean
    reviewDurationMs?: boolean
    createdAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
    verse?: boolean | VerseDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["reviewLog"]>

  export type ReviewLogSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    verseKey?: boolean
    grade?: boolean
    quality?: boolean
    intervalDays?: boolean
    easeFactorAfter?: boolean
    difficultyAfter?: boolean
    stabilityAfter?: boolean
    scheduler?: boolean
    reviewDurationMs?: boolean
    createdAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
    verse?: boolean | VerseDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["reviewLog"]>

  export type ReviewLogSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    verseKey?: boolean
    grade?: boolean
    quality?: boolean
    intervalDays?: boolean
    easeFactorAfter?: boolean
    difficultyAfter?: boolean
    stabilityAfter?: boolean
    scheduler?: boolean
    reviewDurationMs?: boolean
    createdAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
    verse?: boolean | VerseDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["reviewLog"]>

  export type ReviewLogSelectScalar = {
    id?: boolean
    userId?: boolean
    verseKey?: boolean
    grade?: boolean
    quality?: boolean
    intervalDays?: boolean
    easeFactorAfter?: boolean
    difficultyAfter?: boolean
    stabilityAfter?: boolean
    scheduler?: boolean
    reviewDurationMs?: boolean
    createdAt?: boolean
  }

  export type ReviewLogOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "userId" | "verseKey" | "grade" | "quality" | "intervalDays" | "easeFactorAfter" | "difficultyAfter" | "stabilityAfter" | "scheduler" | "reviewDurationMs" | "createdAt", ExtArgs["result"]["reviewLog"]>
  export type ReviewLogInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
    verse?: boolean | VerseDefaultArgs<ExtArgs>
  }
  export type ReviewLogIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
    verse?: boolean | VerseDefaultArgs<ExtArgs>
  }
  export type ReviewLogIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
    verse?: boolean | VerseDefaultArgs<ExtArgs>
  }

  export type $ReviewLogPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ReviewLog"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
      verse: Prisma.$VersePayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      userId: string
      verseKey: string
      grade: string
      quality: number
      intervalDays: number
      easeFactorAfter: number
      difficultyAfter: number | null
      stabilityAfter: number | null
      scheduler: string
      reviewDurationMs: number
      createdAt: Date
    }, ExtArgs["result"]["reviewLog"]>
    composites: {}
  }

  type ReviewLogGetPayload<S extends boolean | null | undefined | ReviewLogDefaultArgs> = $Result.GetResult<Prisma.$ReviewLogPayload, S>

  type ReviewLogCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ReviewLogFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ReviewLogCountAggregateInputType | true
    }

  export interface ReviewLogDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ReviewLog'], meta: { name: 'ReviewLog' } }
    /**
     * Find zero or one ReviewLog that matches the filter.
     * @param {ReviewLogFindUniqueArgs} args - Arguments to find a ReviewLog
     * @example
     * // Get one ReviewLog
     * const reviewLog = await prisma.reviewLog.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ReviewLogFindUniqueArgs>(args: SelectSubset<T, ReviewLogFindUniqueArgs<ExtArgs>>): Prisma__ReviewLogClient<$Result.GetResult<Prisma.$ReviewLogPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one ReviewLog that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ReviewLogFindUniqueOrThrowArgs} args - Arguments to find a ReviewLog
     * @example
     * // Get one ReviewLog
     * const reviewLog = await prisma.reviewLog.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ReviewLogFindUniqueOrThrowArgs>(args: SelectSubset<T, ReviewLogFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ReviewLogClient<$Result.GetResult<Prisma.$ReviewLogPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ReviewLog that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReviewLogFindFirstArgs} args - Arguments to find a ReviewLog
     * @example
     * // Get one ReviewLog
     * const reviewLog = await prisma.reviewLog.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ReviewLogFindFirstArgs>(args?: SelectSubset<T, ReviewLogFindFirstArgs<ExtArgs>>): Prisma__ReviewLogClient<$Result.GetResult<Prisma.$ReviewLogPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ReviewLog that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReviewLogFindFirstOrThrowArgs} args - Arguments to find a ReviewLog
     * @example
     * // Get one ReviewLog
     * const reviewLog = await prisma.reviewLog.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ReviewLogFindFirstOrThrowArgs>(args?: SelectSubset<T, ReviewLogFindFirstOrThrowArgs<ExtArgs>>): Prisma__ReviewLogClient<$Result.GetResult<Prisma.$ReviewLogPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more ReviewLogs that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReviewLogFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ReviewLogs
     * const reviewLogs = await prisma.reviewLog.findMany()
     * 
     * // Get first 10 ReviewLogs
     * const reviewLogs = await prisma.reviewLog.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const reviewLogWithIdOnly = await prisma.reviewLog.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ReviewLogFindManyArgs>(args?: SelectSubset<T, ReviewLogFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ReviewLogPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a ReviewLog.
     * @param {ReviewLogCreateArgs} args - Arguments to create a ReviewLog.
     * @example
     * // Create one ReviewLog
     * const ReviewLog = await prisma.reviewLog.create({
     *   data: {
     *     // ... data to create a ReviewLog
     *   }
     * })
     * 
     */
    create<T extends ReviewLogCreateArgs>(args: SelectSubset<T, ReviewLogCreateArgs<ExtArgs>>): Prisma__ReviewLogClient<$Result.GetResult<Prisma.$ReviewLogPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many ReviewLogs.
     * @param {ReviewLogCreateManyArgs} args - Arguments to create many ReviewLogs.
     * @example
     * // Create many ReviewLogs
     * const reviewLog = await prisma.reviewLog.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ReviewLogCreateManyArgs>(args?: SelectSubset<T, ReviewLogCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many ReviewLogs and returns the data saved in the database.
     * @param {ReviewLogCreateManyAndReturnArgs} args - Arguments to create many ReviewLogs.
     * @example
     * // Create many ReviewLogs
     * const reviewLog = await prisma.reviewLog.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many ReviewLogs and only return the `id`
     * const reviewLogWithIdOnly = await prisma.reviewLog.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ReviewLogCreateManyAndReturnArgs>(args?: SelectSubset<T, ReviewLogCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ReviewLogPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a ReviewLog.
     * @param {ReviewLogDeleteArgs} args - Arguments to delete one ReviewLog.
     * @example
     * // Delete one ReviewLog
     * const ReviewLog = await prisma.reviewLog.delete({
     *   where: {
     *     // ... filter to delete one ReviewLog
     *   }
     * })
     * 
     */
    delete<T extends ReviewLogDeleteArgs>(args: SelectSubset<T, ReviewLogDeleteArgs<ExtArgs>>): Prisma__ReviewLogClient<$Result.GetResult<Prisma.$ReviewLogPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one ReviewLog.
     * @param {ReviewLogUpdateArgs} args - Arguments to update one ReviewLog.
     * @example
     * // Update one ReviewLog
     * const reviewLog = await prisma.reviewLog.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ReviewLogUpdateArgs>(args: SelectSubset<T, ReviewLogUpdateArgs<ExtArgs>>): Prisma__ReviewLogClient<$Result.GetResult<Prisma.$ReviewLogPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more ReviewLogs.
     * @param {ReviewLogDeleteManyArgs} args - Arguments to filter ReviewLogs to delete.
     * @example
     * // Delete a few ReviewLogs
     * const { count } = await prisma.reviewLog.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ReviewLogDeleteManyArgs>(args?: SelectSubset<T, ReviewLogDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ReviewLogs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReviewLogUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ReviewLogs
     * const reviewLog = await prisma.reviewLog.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ReviewLogUpdateManyArgs>(args: SelectSubset<T, ReviewLogUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ReviewLogs and returns the data updated in the database.
     * @param {ReviewLogUpdateManyAndReturnArgs} args - Arguments to update many ReviewLogs.
     * @example
     * // Update many ReviewLogs
     * const reviewLog = await prisma.reviewLog.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more ReviewLogs and only return the `id`
     * const reviewLogWithIdOnly = await prisma.reviewLog.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends ReviewLogUpdateManyAndReturnArgs>(args: SelectSubset<T, ReviewLogUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ReviewLogPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one ReviewLog.
     * @param {ReviewLogUpsertArgs} args - Arguments to update or create a ReviewLog.
     * @example
     * // Update or create a ReviewLog
     * const reviewLog = await prisma.reviewLog.upsert({
     *   create: {
     *     // ... data to create a ReviewLog
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ReviewLog we want to update
     *   }
     * })
     */
    upsert<T extends ReviewLogUpsertArgs>(args: SelectSubset<T, ReviewLogUpsertArgs<ExtArgs>>): Prisma__ReviewLogClient<$Result.GetResult<Prisma.$ReviewLogPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of ReviewLogs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReviewLogCountArgs} args - Arguments to filter ReviewLogs to count.
     * @example
     * // Count the number of ReviewLogs
     * const count = await prisma.reviewLog.count({
     *   where: {
     *     // ... the filter for the ReviewLogs we want to count
     *   }
     * })
    **/
    count<T extends ReviewLogCountArgs>(
      args?: Subset<T, ReviewLogCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ReviewLogCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ReviewLog.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReviewLogAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ReviewLogAggregateArgs>(args: Subset<T, ReviewLogAggregateArgs>): Prisma.PrismaPromise<GetReviewLogAggregateType<T>>

    /**
     * Group by ReviewLog.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReviewLogGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ReviewLogGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ReviewLogGroupByArgs['orderBy'] }
        : { orderBy?: ReviewLogGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ReviewLogGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetReviewLogGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ReviewLog model
   */
  readonly fields: ReviewLogFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ReviewLog.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ReviewLogClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    verse<T extends VerseDefaultArgs<ExtArgs> = {}>(args?: Subset<T, VerseDefaultArgs<ExtArgs>>): Prisma__VerseClient<$Result.GetResult<Prisma.$VersePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the ReviewLog model
   */
  interface ReviewLogFieldRefs {
    readonly id: FieldRef<"ReviewLog", 'String'>
    readonly userId: FieldRef<"ReviewLog", 'String'>
    readonly verseKey: FieldRef<"ReviewLog", 'String'>
    readonly grade: FieldRef<"ReviewLog", 'String'>
    readonly quality: FieldRef<"ReviewLog", 'Int'>
    readonly intervalDays: FieldRef<"ReviewLog", 'Float'>
    readonly easeFactorAfter: FieldRef<"ReviewLog", 'Float'>
    readonly difficultyAfter: FieldRef<"ReviewLog", 'Float'>
    readonly stabilityAfter: FieldRef<"ReviewLog", 'Float'>
    readonly scheduler: FieldRef<"ReviewLog", 'String'>
    readonly reviewDurationMs: FieldRef<"ReviewLog", 'Int'>
    readonly createdAt: FieldRef<"ReviewLog", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * ReviewLog findUnique
   */
  export type ReviewLogFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReviewLog
     */
    select?: ReviewLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReviewLog
     */
    omit?: ReviewLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReviewLogInclude<ExtArgs> | null
    /**
     * Filter, which ReviewLog to fetch.
     */
    where: ReviewLogWhereUniqueInput
  }

  /**
   * ReviewLog findUniqueOrThrow
   */
  export type ReviewLogFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReviewLog
     */
    select?: ReviewLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReviewLog
     */
    omit?: ReviewLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReviewLogInclude<ExtArgs> | null
    /**
     * Filter, which ReviewLog to fetch.
     */
    where: ReviewLogWhereUniqueInput
  }

  /**
   * ReviewLog findFirst
   */
  export type ReviewLogFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReviewLog
     */
    select?: ReviewLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReviewLog
     */
    omit?: ReviewLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReviewLogInclude<ExtArgs> | null
    /**
     * Filter, which ReviewLog to fetch.
     */
    where?: ReviewLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ReviewLogs to fetch.
     */
    orderBy?: ReviewLogOrderByWithRelationInput | ReviewLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ReviewLogs.
     */
    cursor?: ReviewLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ReviewLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ReviewLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ReviewLogs.
     */
    distinct?: ReviewLogScalarFieldEnum | ReviewLogScalarFieldEnum[]
  }

  /**
   * ReviewLog findFirstOrThrow
   */
  export type ReviewLogFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReviewLog
     */
    select?: ReviewLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReviewLog
     */
    omit?: ReviewLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReviewLogInclude<ExtArgs> | null
    /**
     * Filter, which ReviewLog to fetch.
     */
    where?: ReviewLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ReviewLogs to fetch.
     */
    orderBy?: ReviewLogOrderByWithRelationInput | ReviewLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ReviewLogs.
     */
    cursor?: ReviewLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ReviewLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ReviewLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ReviewLogs.
     */
    distinct?: ReviewLogScalarFieldEnum | ReviewLogScalarFieldEnum[]
  }

  /**
   * ReviewLog findMany
   */
  export type ReviewLogFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReviewLog
     */
    select?: ReviewLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReviewLog
     */
    omit?: ReviewLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReviewLogInclude<ExtArgs> | null
    /**
     * Filter, which ReviewLogs to fetch.
     */
    where?: ReviewLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ReviewLogs to fetch.
     */
    orderBy?: ReviewLogOrderByWithRelationInput | ReviewLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ReviewLogs.
     */
    cursor?: ReviewLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ReviewLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ReviewLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ReviewLogs.
     */
    distinct?: ReviewLogScalarFieldEnum | ReviewLogScalarFieldEnum[]
  }

  /**
   * ReviewLog create
   */
  export type ReviewLogCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReviewLog
     */
    select?: ReviewLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReviewLog
     */
    omit?: ReviewLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReviewLogInclude<ExtArgs> | null
    /**
     * The data needed to create a ReviewLog.
     */
    data: XOR<ReviewLogCreateInput, ReviewLogUncheckedCreateInput>
  }

  /**
   * ReviewLog createMany
   */
  export type ReviewLogCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ReviewLogs.
     */
    data: ReviewLogCreateManyInput | ReviewLogCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ReviewLog createManyAndReturn
   */
  export type ReviewLogCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReviewLog
     */
    select?: ReviewLogSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ReviewLog
     */
    omit?: ReviewLogOmit<ExtArgs> | null
    /**
     * The data used to create many ReviewLogs.
     */
    data: ReviewLogCreateManyInput | ReviewLogCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReviewLogIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * ReviewLog update
   */
  export type ReviewLogUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReviewLog
     */
    select?: ReviewLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReviewLog
     */
    omit?: ReviewLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReviewLogInclude<ExtArgs> | null
    /**
     * The data needed to update a ReviewLog.
     */
    data: XOR<ReviewLogUpdateInput, ReviewLogUncheckedUpdateInput>
    /**
     * Choose, which ReviewLog to update.
     */
    where: ReviewLogWhereUniqueInput
  }

  /**
   * ReviewLog updateMany
   */
  export type ReviewLogUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ReviewLogs.
     */
    data: XOR<ReviewLogUpdateManyMutationInput, ReviewLogUncheckedUpdateManyInput>
    /**
     * Filter which ReviewLogs to update
     */
    where?: ReviewLogWhereInput
    /**
     * Limit how many ReviewLogs to update.
     */
    limit?: number
  }

  /**
   * ReviewLog updateManyAndReturn
   */
  export type ReviewLogUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReviewLog
     */
    select?: ReviewLogSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ReviewLog
     */
    omit?: ReviewLogOmit<ExtArgs> | null
    /**
     * The data used to update ReviewLogs.
     */
    data: XOR<ReviewLogUpdateManyMutationInput, ReviewLogUncheckedUpdateManyInput>
    /**
     * Filter which ReviewLogs to update
     */
    where?: ReviewLogWhereInput
    /**
     * Limit how many ReviewLogs to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReviewLogIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * ReviewLog upsert
   */
  export type ReviewLogUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReviewLog
     */
    select?: ReviewLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReviewLog
     */
    omit?: ReviewLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReviewLogInclude<ExtArgs> | null
    /**
     * The filter to search for the ReviewLog to update in case it exists.
     */
    where: ReviewLogWhereUniqueInput
    /**
     * In case the ReviewLog found by the `where` argument doesn't exist, create a new ReviewLog with this data.
     */
    create: XOR<ReviewLogCreateInput, ReviewLogUncheckedCreateInput>
    /**
     * In case the ReviewLog was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ReviewLogUpdateInput, ReviewLogUncheckedUpdateInput>
  }

  /**
   * ReviewLog delete
   */
  export type ReviewLogDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReviewLog
     */
    select?: ReviewLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReviewLog
     */
    omit?: ReviewLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReviewLogInclude<ExtArgs> | null
    /**
     * Filter which ReviewLog to delete.
     */
    where: ReviewLogWhereUniqueInput
  }

  /**
   * ReviewLog deleteMany
   */
  export type ReviewLogDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ReviewLogs to delete
     */
    where?: ReviewLogWhereInput
    /**
     * Limit how many ReviewLogs to delete.
     */
    limit?: number
  }

  /**
   * ReviewLog without action
   */
  export type ReviewLogDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReviewLog
     */
    select?: ReviewLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReviewLog
     */
    omit?: ReviewLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReviewLogInclude<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const UserScalarFieldEnum: {
    id: 'id',
    email: 'email',
    passwordHash: 'passwordHash',
    createdAt: 'createdAt',
    dailyTargetCount: 'dailyTargetCount',
    currentStreak: 'currentStreak',
    longestStreak: 'longestStreak',
    lastActiveDate: 'lastActiveDate',
    scheduler: 'scheduler',
    requestRetention: 'requestRetention'
  };

  export type UserScalarFieldEnum = (typeof UserScalarFieldEnum)[keyof typeof UserScalarFieldEnum]


  export const SessionScalarFieldEnum: {
    id: 'id',
    token: 'token',
    userId: 'userId',
    expiresAt: 'expiresAt',
    createdAt: 'createdAt'
  };

  export type SessionScalarFieldEnum = (typeof SessionScalarFieldEnum)[keyof typeof SessionScalarFieldEnum]


  export const SurahScalarFieldEnum: {
    id: 'id',
    nameArabic: 'nameArabic',
    nameSimple: 'nameSimple',
    englishName: 'englishName',
    revelationPlace: 'revelationPlace',
    ayahCount: 'ayahCount'
  };

  export type SurahScalarFieldEnum = (typeof SurahScalarFieldEnum)[keyof typeof SurahScalarFieldEnum]


  export const VerseScalarFieldEnum: {
    verseKey: 'verseKey',
    surahId: 'surahId',
    ayahNumber: 'ayahNumber',
    pageNumber: 'pageNumber',
    uthmaniText: 'uthmaniText',
    translation: 'translation',
    audioUrl: 'audioUrl',
    timestampsJson: 'timestampsJson',
    wordsJson: 'wordsJson',
    wordsSource: 'wordsSource',
    recitationUrl: 'recitationUrl',
    tafsir: 'tafsir',
    createdAt: 'createdAt'
  };

  export type VerseScalarFieldEnum = (typeof VerseScalarFieldEnum)[keyof typeof VerseScalarFieldEnum]


  export const UserMemoryStateScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    verseKey: 'verseKey',
    state: 'state',
    intervalDays: 'intervalDays',
    easeFactor: 'easeFactor',
    repetitionCount: 'repetitionCount',
    lapses: 'lapses',
    difficulty: 'difficulty',
    stability: 'stability',
    dueDate: 'dueDate',
    lastReviewedAt: 'lastReviewedAt'
  };

  export type UserMemoryStateScalarFieldEnum = (typeof UserMemoryStateScalarFieldEnum)[keyof typeof UserMemoryStateScalarFieldEnum]


  export const RecitationAudioScalarFieldEnum: {
    id: 'id',
    verseKey: 'verseKey',
    reciterId: 'reciterId',
    url: 'url'
  };

  export type RecitationAudioScalarFieldEnum = (typeof RecitationAudioScalarFieldEnum)[keyof typeof RecitationAudioScalarFieldEnum]


  export const ReviewLogScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    verseKey: 'verseKey',
    grade: 'grade',
    quality: 'quality',
    intervalDays: 'intervalDays',
    easeFactorAfter: 'easeFactorAfter',
    difficultyAfter: 'difficultyAfter',
    stabilityAfter: 'stabilityAfter',
    scheduler: 'scheduler',
    reviewDurationMs: 'reviewDurationMs',
    createdAt: 'createdAt'
  };

  export type ReviewLogScalarFieldEnum = (typeof ReviewLogScalarFieldEnum)[keyof typeof ReviewLogScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    
  /**
   * Deep Input Types
   */


  export type UserWhereInput = {
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    id?: StringFilter<"User"> | string
    email?: StringFilter<"User"> | string
    passwordHash?: StringNullableFilter<"User"> | string | null
    createdAt?: DateTimeFilter<"User"> | Date | string
    dailyTargetCount?: IntFilter<"User"> | number
    currentStreak?: IntFilter<"User"> | number
    longestStreak?: IntFilter<"User"> | number
    lastActiveDate?: DateTimeNullableFilter<"User"> | Date | string | null
    scheduler?: StringFilter<"User"> | string
    requestRetention?: FloatFilter<"User"> | number
    sessions?: SessionListRelationFilter
    memoryStates?: UserMemoryStateListRelationFilter
    reviewLogs?: ReviewLogListRelationFilter
  }

  export type UserOrderByWithRelationInput = {
    id?: SortOrder
    email?: SortOrder
    passwordHash?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    dailyTargetCount?: SortOrder
    currentStreak?: SortOrder
    longestStreak?: SortOrder
    lastActiveDate?: SortOrderInput | SortOrder
    scheduler?: SortOrder
    requestRetention?: SortOrder
    sessions?: SessionOrderByRelationAggregateInput
    memoryStates?: UserMemoryStateOrderByRelationAggregateInput
    reviewLogs?: ReviewLogOrderByRelationAggregateInput
  }

  export type UserWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    email?: string
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    passwordHash?: StringNullableFilter<"User"> | string | null
    createdAt?: DateTimeFilter<"User"> | Date | string
    dailyTargetCount?: IntFilter<"User"> | number
    currentStreak?: IntFilter<"User"> | number
    longestStreak?: IntFilter<"User"> | number
    lastActiveDate?: DateTimeNullableFilter<"User"> | Date | string | null
    scheduler?: StringFilter<"User"> | string
    requestRetention?: FloatFilter<"User"> | number
    sessions?: SessionListRelationFilter
    memoryStates?: UserMemoryStateListRelationFilter
    reviewLogs?: ReviewLogListRelationFilter
  }, "id" | "email">

  export type UserOrderByWithAggregationInput = {
    id?: SortOrder
    email?: SortOrder
    passwordHash?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    dailyTargetCount?: SortOrder
    currentStreak?: SortOrder
    longestStreak?: SortOrder
    lastActiveDate?: SortOrderInput | SortOrder
    scheduler?: SortOrder
    requestRetention?: SortOrder
    _count?: UserCountOrderByAggregateInput
    _avg?: UserAvgOrderByAggregateInput
    _max?: UserMaxOrderByAggregateInput
    _min?: UserMinOrderByAggregateInput
    _sum?: UserSumOrderByAggregateInput
  }

  export type UserScalarWhereWithAggregatesInput = {
    AND?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    OR?: UserScalarWhereWithAggregatesInput[]
    NOT?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"User"> | string
    email?: StringWithAggregatesFilter<"User"> | string
    passwordHash?: StringNullableWithAggregatesFilter<"User"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"User"> | Date | string
    dailyTargetCount?: IntWithAggregatesFilter<"User"> | number
    currentStreak?: IntWithAggregatesFilter<"User"> | number
    longestStreak?: IntWithAggregatesFilter<"User"> | number
    lastActiveDate?: DateTimeNullableWithAggregatesFilter<"User"> | Date | string | null
    scheduler?: StringWithAggregatesFilter<"User"> | string
    requestRetention?: FloatWithAggregatesFilter<"User"> | number
  }

  export type SessionWhereInput = {
    AND?: SessionWhereInput | SessionWhereInput[]
    OR?: SessionWhereInput[]
    NOT?: SessionWhereInput | SessionWhereInput[]
    id?: StringFilter<"Session"> | string
    token?: StringFilter<"Session"> | string
    userId?: StringFilter<"Session"> | string
    expiresAt?: DateTimeFilter<"Session"> | Date | string
    createdAt?: DateTimeFilter<"Session"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }

  export type SessionOrderByWithRelationInput = {
    id?: SortOrder
    token?: SortOrder
    userId?: SortOrder
    expiresAt?: SortOrder
    createdAt?: SortOrder
    user?: UserOrderByWithRelationInput
  }

  export type SessionWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    token?: string
    AND?: SessionWhereInput | SessionWhereInput[]
    OR?: SessionWhereInput[]
    NOT?: SessionWhereInput | SessionWhereInput[]
    userId?: StringFilter<"Session"> | string
    expiresAt?: DateTimeFilter<"Session"> | Date | string
    createdAt?: DateTimeFilter<"Session"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }, "id" | "token">

  export type SessionOrderByWithAggregationInput = {
    id?: SortOrder
    token?: SortOrder
    userId?: SortOrder
    expiresAt?: SortOrder
    createdAt?: SortOrder
    _count?: SessionCountOrderByAggregateInput
    _max?: SessionMaxOrderByAggregateInput
    _min?: SessionMinOrderByAggregateInput
  }

  export type SessionScalarWhereWithAggregatesInput = {
    AND?: SessionScalarWhereWithAggregatesInput | SessionScalarWhereWithAggregatesInput[]
    OR?: SessionScalarWhereWithAggregatesInput[]
    NOT?: SessionScalarWhereWithAggregatesInput | SessionScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Session"> | string
    token?: StringWithAggregatesFilter<"Session"> | string
    userId?: StringWithAggregatesFilter<"Session"> | string
    expiresAt?: DateTimeWithAggregatesFilter<"Session"> | Date | string
    createdAt?: DateTimeWithAggregatesFilter<"Session"> | Date | string
  }

  export type SurahWhereInput = {
    AND?: SurahWhereInput | SurahWhereInput[]
    OR?: SurahWhereInput[]
    NOT?: SurahWhereInput | SurahWhereInput[]
    id?: IntFilter<"Surah"> | number
    nameArabic?: StringFilter<"Surah"> | string
    nameSimple?: StringFilter<"Surah"> | string
    englishName?: StringFilter<"Surah"> | string
    revelationPlace?: StringFilter<"Surah"> | string
    ayahCount?: IntFilter<"Surah"> | number
  }

  export type SurahOrderByWithRelationInput = {
    id?: SortOrder
    nameArabic?: SortOrder
    nameSimple?: SortOrder
    englishName?: SortOrder
    revelationPlace?: SortOrder
    ayahCount?: SortOrder
  }

  export type SurahWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    AND?: SurahWhereInput | SurahWhereInput[]
    OR?: SurahWhereInput[]
    NOT?: SurahWhereInput | SurahWhereInput[]
    nameArabic?: StringFilter<"Surah"> | string
    nameSimple?: StringFilter<"Surah"> | string
    englishName?: StringFilter<"Surah"> | string
    revelationPlace?: StringFilter<"Surah"> | string
    ayahCount?: IntFilter<"Surah"> | number
  }, "id">

  export type SurahOrderByWithAggregationInput = {
    id?: SortOrder
    nameArabic?: SortOrder
    nameSimple?: SortOrder
    englishName?: SortOrder
    revelationPlace?: SortOrder
    ayahCount?: SortOrder
    _count?: SurahCountOrderByAggregateInput
    _avg?: SurahAvgOrderByAggregateInput
    _max?: SurahMaxOrderByAggregateInput
    _min?: SurahMinOrderByAggregateInput
    _sum?: SurahSumOrderByAggregateInput
  }

  export type SurahScalarWhereWithAggregatesInput = {
    AND?: SurahScalarWhereWithAggregatesInput | SurahScalarWhereWithAggregatesInput[]
    OR?: SurahScalarWhereWithAggregatesInput[]
    NOT?: SurahScalarWhereWithAggregatesInput | SurahScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"Surah"> | number
    nameArabic?: StringWithAggregatesFilter<"Surah"> | string
    nameSimple?: StringWithAggregatesFilter<"Surah"> | string
    englishName?: StringWithAggregatesFilter<"Surah"> | string
    revelationPlace?: StringWithAggregatesFilter<"Surah"> | string
    ayahCount?: IntWithAggregatesFilter<"Surah"> | number
  }

  export type VerseWhereInput = {
    AND?: VerseWhereInput | VerseWhereInput[]
    OR?: VerseWhereInput[]
    NOT?: VerseWhereInput | VerseWhereInput[]
    verseKey?: StringFilter<"Verse"> | string
    surahId?: IntFilter<"Verse"> | number
    ayahNumber?: IntFilter<"Verse"> | number
    pageNumber?: IntFilter<"Verse"> | number
    uthmaniText?: StringFilter<"Verse"> | string
    translation?: StringFilter<"Verse"> | string
    audioUrl?: StringFilter<"Verse"> | string
    timestampsJson?: StringFilter<"Verse"> | string
    wordsJson?: StringNullableFilter<"Verse"> | string | null
    wordsSource?: StringFilter<"Verse"> | string
    recitationUrl?: StringNullableFilter<"Verse"> | string | null
    tafsir?: StringNullableFilter<"Verse"> | string | null
    createdAt?: DateTimeFilter<"Verse"> | Date | string
    memoryStates?: UserMemoryStateListRelationFilter
    reviewLogs?: ReviewLogListRelationFilter
  }

  export type VerseOrderByWithRelationInput = {
    verseKey?: SortOrder
    surahId?: SortOrder
    ayahNumber?: SortOrder
    pageNumber?: SortOrder
    uthmaniText?: SortOrder
    translation?: SortOrder
    audioUrl?: SortOrder
    timestampsJson?: SortOrder
    wordsJson?: SortOrderInput | SortOrder
    wordsSource?: SortOrder
    recitationUrl?: SortOrderInput | SortOrder
    tafsir?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    memoryStates?: UserMemoryStateOrderByRelationAggregateInput
    reviewLogs?: ReviewLogOrderByRelationAggregateInput
  }

  export type VerseWhereUniqueInput = Prisma.AtLeast<{
    verseKey?: string
    AND?: VerseWhereInput | VerseWhereInput[]
    OR?: VerseWhereInput[]
    NOT?: VerseWhereInput | VerseWhereInput[]
    surahId?: IntFilter<"Verse"> | number
    ayahNumber?: IntFilter<"Verse"> | number
    pageNumber?: IntFilter<"Verse"> | number
    uthmaniText?: StringFilter<"Verse"> | string
    translation?: StringFilter<"Verse"> | string
    audioUrl?: StringFilter<"Verse"> | string
    timestampsJson?: StringFilter<"Verse"> | string
    wordsJson?: StringNullableFilter<"Verse"> | string | null
    wordsSource?: StringFilter<"Verse"> | string
    recitationUrl?: StringNullableFilter<"Verse"> | string | null
    tafsir?: StringNullableFilter<"Verse"> | string | null
    createdAt?: DateTimeFilter<"Verse"> | Date | string
    memoryStates?: UserMemoryStateListRelationFilter
    reviewLogs?: ReviewLogListRelationFilter
  }, "verseKey">

  export type VerseOrderByWithAggregationInput = {
    verseKey?: SortOrder
    surahId?: SortOrder
    ayahNumber?: SortOrder
    pageNumber?: SortOrder
    uthmaniText?: SortOrder
    translation?: SortOrder
    audioUrl?: SortOrder
    timestampsJson?: SortOrder
    wordsJson?: SortOrderInput | SortOrder
    wordsSource?: SortOrder
    recitationUrl?: SortOrderInput | SortOrder
    tafsir?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    _count?: VerseCountOrderByAggregateInput
    _avg?: VerseAvgOrderByAggregateInput
    _max?: VerseMaxOrderByAggregateInput
    _min?: VerseMinOrderByAggregateInput
    _sum?: VerseSumOrderByAggregateInput
  }

  export type VerseScalarWhereWithAggregatesInput = {
    AND?: VerseScalarWhereWithAggregatesInput | VerseScalarWhereWithAggregatesInput[]
    OR?: VerseScalarWhereWithAggregatesInput[]
    NOT?: VerseScalarWhereWithAggregatesInput | VerseScalarWhereWithAggregatesInput[]
    verseKey?: StringWithAggregatesFilter<"Verse"> | string
    surahId?: IntWithAggregatesFilter<"Verse"> | number
    ayahNumber?: IntWithAggregatesFilter<"Verse"> | number
    pageNumber?: IntWithAggregatesFilter<"Verse"> | number
    uthmaniText?: StringWithAggregatesFilter<"Verse"> | string
    translation?: StringWithAggregatesFilter<"Verse"> | string
    audioUrl?: StringWithAggregatesFilter<"Verse"> | string
    timestampsJson?: StringWithAggregatesFilter<"Verse"> | string
    wordsJson?: StringNullableWithAggregatesFilter<"Verse"> | string | null
    wordsSource?: StringWithAggregatesFilter<"Verse"> | string
    recitationUrl?: StringNullableWithAggregatesFilter<"Verse"> | string | null
    tafsir?: StringNullableWithAggregatesFilter<"Verse"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"Verse"> | Date | string
  }

  export type UserMemoryStateWhereInput = {
    AND?: UserMemoryStateWhereInput | UserMemoryStateWhereInput[]
    OR?: UserMemoryStateWhereInput[]
    NOT?: UserMemoryStateWhereInput | UserMemoryStateWhereInput[]
    id?: StringFilter<"UserMemoryState"> | string
    userId?: StringFilter<"UserMemoryState"> | string
    verseKey?: StringFilter<"UserMemoryState"> | string
    state?: StringFilter<"UserMemoryState"> | string
    intervalDays?: FloatFilter<"UserMemoryState"> | number
    easeFactor?: FloatFilter<"UserMemoryState"> | number
    repetitionCount?: IntFilter<"UserMemoryState"> | number
    lapses?: IntFilter<"UserMemoryState"> | number
    difficulty?: FloatNullableFilter<"UserMemoryState"> | number | null
    stability?: FloatNullableFilter<"UserMemoryState"> | number | null
    dueDate?: DateTimeFilter<"UserMemoryState"> | Date | string
    lastReviewedAt?: DateTimeNullableFilter<"UserMemoryState"> | Date | string | null
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
    verse?: XOR<VerseScalarRelationFilter, VerseWhereInput>
  }

  export type UserMemoryStateOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrder
    verseKey?: SortOrder
    state?: SortOrder
    intervalDays?: SortOrder
    easeFactor?: SortOrder
    repetitionCount?: SortOrder
    lapses?: SortOrder
    difficulty?: SortOrderInput | SortOrder
    stability?: SortOrderInput | SortOrder
    dueDate?: SortOrder
    lastReviewedAt?: SortOrderInput | SortOrder
    user?: UserOrderByWithRelationInput
    verse?: VerseOrderByWithRelationInput
  }

  export type UserMemoryStateWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    userId_verseKey?: UserMemoryStateUserIdVerseKeyCompoundUniqueInput
    AND?: UserMemoryStateWhereInput | UserMemoryStateWhereInput[]
    OR?: UserMemoryStateWhereInput[]
    NOT?: UserMemoryStateWhereInput | UserMemoryStateWhereInput[]
    userId?: StringFilter<"UserMemoryState"> | string
    verseKey?: StringFilter<"UserMemoryState"> | string
    state?: StringFilter<"UserMemoryState"> | string
    intervalDays?: FloatFilter<"UserMemoryState"> | number
    easeFactor?: FloatFilter<"UserMemoryState"> | number
    repetitionCount?: IntFilter<"UserMemoryState"> | number
    lapses?: IntFilter<"UserMemoryState"> | number
    difficulty?: FloatNullableFilter<"UserMemoryState"> | number | null
    stability?: FloatNullableFilter<"UserMemoryState"> | number | null
    dueDate?: DateTimeFilter<"UserMemoryState"> | Date | string
    lastReviewedAt?: DateTimeNullableFilter<"UserMemoryState"> | Date | string | null
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
    verse?: XOR<VerseScalarRelationFilter, VerseWhereInput>
  }, "id" | "userId_verseKey">

  export type UserMemoryStateOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrder
    verseKey?: SortOrder
    state?: SortOrder
    intervalDays?: SortOrder
    easeFactor?: SortOrder
    repetitionCount?: SortOrder
    lapses?: SortOrder
    difficulty?: SortOrderInput | SortOrder
    stability?: SortOrderInput | SortOrder
    dueDate?: SortOrder
    lastReviewedAt?: SortOrderInput | SortOrder
    _count?: UserMemoryStateCountOrderByAggregateInput
    _avg?: UserMemoryStateAvgOrderByAggregateInput
    _max?: UserMemoryStateMaxOrderByAggregateInput
    _min?: UserMemoryStateMinOrderByAggregateInput
    _sum?: UserMemoryStateSumOrderByAggregateInput
  }

  export type UserMemoryStateScalarWhereWithAggregatesInput = {
    AND?: UserMemoryStateScalarWhereWithAggregatesInput | UserMemoryStateScalarWhereWithAggregatesInput[]
    OR?: UserMemoryStateScalarWhereWithAggregatesInput[]
    NOT?: UserMemoryStateScalarWhereWithAggregatesInput | UserMemoryStateScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"UserMemoryState"> | string
    userId?: StringWithAggregatesFilter<"UserMemoryState"> | string
    verseKey?: StringWithAggregatesFilter<"UserMemoryState"> | string
    state?: StringWithAggregatesFilter<"UserMemoryState"> | string
    intervalDays?: FloatWithAggregatesFilter<"UserMemoryState"> | number
    easeFactor?: FloatWithAggregatesFilter<"UserMemoryState"> | number
    repetitionCount?: IntWithAggregatesFilter<"UserMemoryState"> | number
    lapses?: IntWithAggregatesFilter<"UserMemoryState"> | number
    difficulty?: FloatNullableWithAggregatesFilter<"UserMemoryState"> | number | null
    stability?: FloatNullableWithAggregatesFilter<"UserMemoryState"> | number | null
    dueDate?: DateTimeWithAggregatesFilter<"UserMemoryState"> | Date | string
    lastReviewedAt?: DateTimeNullableWithAggregatesFilter<"UserMemoryState"> | Date | string | null
  }

  export type RecitationAudioWhereInput = {
    AND?: RecitationAudioWhereInput | RecitationAudioWhereInput[]
    OR?: RecitationAudioWhereInput[]
    NOT?: RecitationAudioWhereInput | RecitationAudioWhereInput[]
    id?: StringFilter<"RecitationAudio"> | string
    verseKey?: StringFilter<"RecitationAudio"> | string
    reciterId?: IntFilter<"RecitationAudio"> | number
    url?: StringFilter<"RecitationAudio"> | string
  }

  export type RecitationAudioOrderByWithRelationInput = {
    id?: SortOrder
    verseKey?: SortOrder
    reciterId?: SortOrder
    url?: SortOrder
  }

  export type RecitationAudioWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    verseKey_reciterId?: RecitationAudioVerseKeyReciterIdCompoundUniqueInput
    AND?: RecitationAudioWhereInput | RecitationAudioWhereInput[]
    OR?: RecitationAudioWhereInput[]
    NOT?: RecitationAudioWhereInput | RecitationAudioWhereInput[]
    verseKey?: StringFilter<"RecitationAudio"> | string
    reciterId?: IntFilter<"RecitationAudio"> | number
    url?: StringFilter<"RecitationAudio"> | string
  }, "id" | "verseKey_reciterId">

  export type RecitationAudioOrderByWithAggregationInput = {
    id?: SortOrder
    verseKey?: SortOrder
    reciterId?: SortOrder
    url?: SortOrder
    _count?: RecitationAudioCountOrderByAggregateInput
    _avg?: RecitationAudioAvgOrderByAggregateInput
    _max?: RecitationAudioMaxOrderByAggregateInput
    _min?: RecitationAudioMinOrderByAggregateInput
    _sum?: RecitationAudioSumOrderByAggregateInput
  }

  export type RecitationAudioScalarWhereWithAggregatesInput = {
    AND?: RecitationAudioScalarWhereWithAggregatesInput | RecitationAudioScalarWhereWithAggregatesInput[]
    OR?: RecitationAudioScalarWhereWithAggregatesInput[]
    NOT?: RecitationAudioScalarWhereWithAggregatesInput | RecitationAudioScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"RecitationAudio"> | string
    verseKey?: StringWithAggregatesFilter<"RecitationAudio"> | string
    reciterId?: IntWithAggregatesFilter<"RecitationAudio"> | number
    url?: StringWithAggregatesFilter<"RecitationAudio"> | string
  }

  export type ReviewLogWhereInput = {
    AND?: ReviewLogWhereInput | ReviewLogWhereInput[]
    OR?: ReviewLogWhereInput[]
    NOT?: ReviewLogWhereInput | ReviewLogWhereInput[]
    id?: StringFilter<"ReviewLog"> | string
    userId?: StringFilter<"ReviewLog"> | string
    verseKey?: StringFilter<"ReviewLog"> | string
    grade?: StringFilter<"ReviewLog"> | string
    quality?: IntFilter<"ReviewLog"> | number
    intervalDays?: FloatFilter<"ReviewLog"> | number
    easeFactorAfter?: FloatFilter<"ReviewLog"> | number
    difficultyAfter?: FloatNullableFilter<"ReviewLog"> | number | null
    stabilityAfter?: FloatNullableFilter<"ReviewLog"> | number | null
    scheduler?: StringFilter<"ReviewLog"> | string
    reviewDurationMs?: IntFilter<"ReviewLog"> | number
    createdAt?: DateTimeFilter<"ReviewLog"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
    verse?: XOR<VerseScalarRelationFilter, VerseWhereInput>
  }

  export type ReviewLogOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrder
    verseKey?: SortOrder
    grade?: SortOrder
    quality?: SortOrder
    intervalDays?: SortOrder
    easeFactorAfter?: SortOrder
    difficultyAfter?: SortOrderInput | SortOrder
    stabilityAfter?: SortOrderInput | SortOrder
    scheduler?: SortOrder
    reviewDurationMs?: SortOrder
    createdAt?: SortOrder
    user?: UserOrderByWithRelationInput
    verse?: VerseOrderByWithRelationInput
  }

  export type ReviewLogWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: ReviewLogWhereInput | ReviewLogWhereInput[]
    OR?: ReviewLogWhereInput[]
    NOT?: ReviewLogWhereInput | ReviewLogWhereInput[]
    userId?: StringFilter<"ReviewLog"> | string
    verseKey?: StringFilter<"ReviewLog"> | string
    grade?: StringFilter<"ReviewLog"> | string
    quality?: IntFilter<"ReviewLog"> | number
    intervalDays?: FloatFilter<"ReviewLog"> | number
    easeFactorAfter?: FloatFilter<"ReviewLog"> | number
    difficultyAfter?: FloatNullableFilter<"ReviewLog"> | number | null
    stabilityAfter?: FloatNullableFilter<"ReviewLog"> | number | null
    scheduler?: StringFilter<"ReviewLog"> | string
    reviewDurationMs?: IntFilter<"ReviewLog"> | number
    createdAt?: DateTimeFilter<"ReviewLog"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
    verse?: XOR<VerseScalarRelationFilter, VerseWhereInput>
  }, "id">

  export type ReviewLogOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrder
    verseKey?: SortOrder
    grade?: SortOrder
    quality?: SortOrder
    intervalDays?: SortOrder
    easeFactorAfter?: SortOrder
    difficultyAfter?: SortOrderInput | SortOrder
    stabilityAfter?: SortOrderInput | SortOrder
    scheduler?: SortOrder
    reviewDurationMs?: SortOrder
    createdAt?: SortOrder
    _count?: ReviewLogCountOrderByAggregateInput
    _avg?: ReviewLogAvgOrderByAggregateInput
    _max?: ReviewLogMaxOrderByAggregateInput
    _min?: ReviewLogMinOrderByAggregateInput
    _sum?: ReviewLogSumOrderByAggregateInput
  }

  export type ReviewLogScalarWhereWithAggregatesInput = {
    AND?: ReviewLogScalarWhereWithAggregatesInput | ReviewLogScalarWhereWithAggregatesInput[]
    OR?: ReviewLogScalarWhereWithAggregatesInput[]
    NOT?: ReviewLogScalarWhereWithAggregatesInput | ReviewLogScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"ReviewLog"> | string
    userId?: StringWithAggregatesFilter<"ReviewLog"> | string
    verseKey?: StringWithAggregatesFilter<"ReviewLog"> | string
    grade?: StringWithAggregatesFilter<"ReviewLog"> | string
    quality?: IntWithAggregatesFilter<"ReviewLog"> | number
    intervalDays?: FloatWithAggregatesFilter<"ReviewLog"> | number
    easeFactorAfter?: FloatWithAggregatesFilter<"ReviewLog"> | number
    difficultyAfter?: FloatNullableWithAggregatesFilter<"ReviewLog"> | number | null
    stabilityAfter?: FloatNullableWithAggregatesFilter<"ReviewLog"> | number | null
    scheduler?: StringWithAggregatesFilter<"ReviewLog"> | string
    reviewDurationMs?: IntWithAggregatesFilter<"ReviewLog"> | number
    createdAt?: DateTimeWithAggregatesFilter<"ReviewLog"> | Date | string
  }

  export type UserCreateInput = {
    id?: string
    email: string
    passwordHash?: string | null
    createdAt?: Date | string
    dailyTargetCount?: number
    currentStreak?: number
    longestStreak?: number
    lastActiveDate?: Date | string | null
    scheduler?: string
    requestRetention?: number
    sessions?: SessionCreateNestedManyWithoutUserInput
    memoryStates?: UserMemoryStateCreateNestedManyWithoutUserInput
    reviewLogs?: ReviewLogCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateInput = {
    id?: string
    email: string
    passwordHash?: string | null
    createdAt?: Date | string
    dailyTargetCount?: number
    currentStreak?: number
    longestStreak?: number
    lastActiveDate?: Date | string | null
    scheduler?: string
    requestRetention?: number
    sessions?: SessionUncheckedCreateNestedManyWithoutUserInput
    memoryStates?: UserMemoryStateUncheckedCreateNestedManyWithoutUserInput
    reviewLogs?: ReviewLogUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    dailyTargetCount?: IntFieldUpdateOperationsInput | number
    currentStreak?: IntFieldUpdateOperationsInput | number
    longestStreak?: IntFieldUpdateOperationsInput | number
    lastActiveDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    scheduler?: StringFieldUpdateOperationsInput | string
    requestRetention?: FloatFieldUpdateOperationsInput | number
    sessions?: SessionUpdateManyWithoutUserNestedInput
    memoryStates?: UserMemoryStateUpdateManyWithoutUserNestedInput
    reviewLogs?: ReviewLogUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    dailyTargetCount?: IntFieldUpdateOperationsInput | number
    currentStreak?: IntFieldUpdateOperationsInput | number
    longestStreak?: IntFieldUpdateOperationsInput | number
    lastActiveDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    scheduler?: StringFieldUpdateOperationsInput | string
    requestRetention?: FloatFieldUpdateOperationsInput | number
    sessions?: SessionUncheckedUpdateManyWithoutUserNestedInput
    memoryStates?: UserMemoryStateUncheckedUpdateManyWithoutUserNestedInput
    reviewLogs?: ReviewLogUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserCreateManyInput = {
    id?: string
    email: string
    passwordHash?: string | null
    createdAt?: Date | string
    dailyTargetCount?: number
    currentStreak?: number
    longestStreak?: number
    lastActiveDate?: Date | string | null
    scheduler?: string
    requestRetention?: number
  }

  export type UserUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    dailyTargetCount?: IntFieldUpdateOperationsInput | number
    currentStreak?: IntFieldUpdateOperationsInput | number
    longestStreak?: IntFieldUpdateOperationsInput | number
    lastActiveDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    scheduler?: StringFieldUpdateOperationsInput | string
    requestRetention?: FloatFieldUpdateOperationsInput | number
  }

  export type UserUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    dailyTargetCount?: IntFieldUpdateOperationsInput | number
    currentStreak?: IntFieldUpdateOperationsInput | number
    longestStreak?: IntFieldUpdateOperationsInput | number
    lastActiveDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    scheduler?: StringFieldUpdateOperationsInput | string
    requestRetention?: FloatFieldUpdateOperationsInput | number
  }

  export type SessionCreateInput = {
    id?: string
    token: string
    expiresAt: Date | string
    createdAt?: Date | string
    user: UserCreateNestedOneWithoutSessionsInput
  }

  export type SessionUncheckedCreateInput = {
    id?: string
    token: string
    userId: string
    expiresAt: Date | string
    createdAt?: Date | string
  }

  export type SessionUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    token?: StringFieldUpdateOperationsInput | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutSessionsNestedInput
  }

  export type SessionUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    token?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SessionCreateManyInput = {
    id?: string
    token: string
    userId: string
    expiresAt: Date | string
    createdAt?: Date | string
  }

  export type SessionUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    token?: StringFieldUpdateOperationsInput | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SessionUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    token?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SurahCreateInput = {
    id: number
    nameArabic: string
    nameSimple: string
    englishName: string
    revelationPlace: string
    ayahCount: number
  }

  export type SurahUncheckedCreateInput = {
    id: number
    nameArabic: string
    nameSimple: string
    englishName: string
    revelationPlace: string
    ayahCount: number
  }

  export type SurahUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    nameArabic?: StringFieldUpdateOperationsInput | string
    nameSimple?: StringFieldUpdateOperationsInput | string
    englishName?: StringFieldUpdateOperationsInput | string
    revelationPlace?: StringFieldUpdateOperationsInput | string
    ayahCount?: IntFieldUpdateOperationsInput | number
  }

  export type SurahUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    nameArabic?: StringFieldUpdateOperationsInput | string
    nameSimple?: StringFieldUpdateOperationsInput | string
    englishName?: StringFieldUpdateOperationsInput | string
    revelationPlace?: StringFieldUpdateOperationsInput | string
    ayahCount?: IntFieldUpdateOperationsInput | number
  }

  export type SurahCreateManyInput = {
    id: number
    nameArabic: string
    nameSimple: string
    englishName: string
    revelationPlace: string
    ayahCount: number
  }

  export type SurahUpdateManyMutationInput = {
    id?: IntFieldUpdateOperationsInput | number
    nameArabic?: StringFieldUpdateOperationsInput | string
    nameSimple?: StringFieldUpdateOperationsInput | string
    englishName?: StringFieldUpdateOperationsInput | string
    revelationPlace?: StringFieldUpdateOperationsInput | string
    ayahCount?: IntFieldUpdateOperationsInput | number
  }

  export type SurahUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    nameArabic?: StringFieldUpdateOperationsInput | string
    nameSimple?: StringFieldUpdateOperationsInput | string
    englishName?: StringFieldUpdateOperationsInput | string
    revelationPlace?: StringFieldUpdateOperationsInput | string
    ayahCount?: IntFieldUpdateOperationsInput | number
  }

  export type VerseCreateInput = {
    verseKey: string
    surahId: number
    ayahNumber: number
    pageNumber: number
    uthmaniText: string
    translation: string
    audioUrl: string
    timestampsJson: string
    wordsJson?: string | null
    wordsSource?: string
    recitationUrl?: string | null
    tafsir?: string | null
    createdAt?: Date | string
    memoryStates?: UserMemoryStateCreateNestedManyWithoutVerseInput
    reviewLogs?: ReviewLogCreateNestedManyWithoutVerseInput
  }

  export type VerseUncheckedCreateInput = {
    verseKey: string
    surahId: number
    ayahNumber: number
    pageNumber: number
    uthmaniText: string
    translation: string
    audioUrl: string
    timestampsJson: string
    wordsJson?: string | null
    wordsSource?: string
    recitationUrl?: string | null
    tafsir?: string | null
    createdAt?: Date | string
    memoryStates?: UserMemoryStateUncheckedCreateNestedManyWithoutVerseInput
    reviewLogs?: ReviewLogUncheckedCreateNestedManyWithoutVerseInput
  }

  export type VerseUpdateInput = {
    verseKey?: StringFieldUpdateOperationsInput | string
    surahId?: IntFieldUpdateOperationsInput | number
    ayahNumber?: IntFieldUpdateOperationsInput | number
    pageNumber?: IntFieldUpdateOperationsInput | number
    uthmaniText?: StringFieldUpdateOperationsInput | string
    translation?: StringFieldUpdateOperationsInput | string
    audioUrl?: StringFieldUpdateOperationsInput | string
    timestampsJson?: StringFieldUpdateOperationsInput | string
    wordsJson?: NullableStringFieldUpdateOperationsInput | string | null
    wordsSource?: StringFieldUpdateOperationsInput | string
    recitationUrl?: NullableStringFieldUpdateOperationsInput | string | null
    tafsir?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    memoryStates?: UserMemoryStateUpdateManyWithoutVerseNestedInput
    reviewLogs?: ReviewLogUpdateManyWithoutVerseNestedInput
  }

  export type VerseUncheckedUpdateInput = {
    verseKey?: StringFieldUpdateOperationsInput | string
    surahId?: IntFieldUpdateOperationsInput | number
    ayahNumber?: IntFieldUpdateOperationsInput | number
    pageNumber?: IntFieldUpdateOperationsInput | number
    uthmaniText?: StringFieldUpdateOperationsInput | string
    translation?: StringFieldUpdateOperationsInput | string
    audioUrl?: StringFieldUpdateOperationsInput | string
    timestampsJson?: StringFieldUpdateOperationsInput | string
    wordsJson?: NullableStringFieldUpdateOperationsInput | string | null
    wordsSource?: StringFieldUpdateOperationsInput | string
    recitationUrl?: NullableStringFieldUpdateOperationsInput | string | null
    tafsir?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    memoryStates?: UserMemoryStateUncheckedUpdateManyWithoutVerseNestedInput
    reviewLogs?: ReviewLogUncheckedUpdateManyWithoutVerseNestedInput
  }

  export type VerseCreateManyInput = {
    verseKey: string
    surahId: number
    ayahNumber: number
    pageNumber: number
    uthmaniText: string
    translation: string
    audioUrl: string
    timestampsJson: string
    wordsJson?: string | null
    wordsSource?: string
    recitationUrl?: string | null
    tafsir?: string | null
    createdAt?: Date | string
  }

  export type VerseUpdateManyMutationInput = {
    verseKey?: StringFieldUpdateOperationsInput | string
    surahId?: IntFieldUpdateOperationsInput | number
    ayahNumber?: IntFieldUpdateOperationsInput | number
    pageNumber?: IntFieldUpdateOperationsInput | number
    uthmaniText?: StringFieldUpdateOperationsInput | string
    translation?: StringFieldUpdateOperationsInput | string
    audioUrl?: StringFieldUpdateOperationsInput | string
    timestampsJson?: StringFieldUpdateOperationsInput | string
    wordsJson?: NullableStringFieldUpdateOperationsInput | string | null
    wordsSource?: StringFieldUpdateOperationsInput | string
    recitationUrl?: NullableStringFieldUpdateOperationsInput | string | null
    tafsir?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type VerseUncheckedUpdateManyInput = {
    verseKey?: StringFieldUpdateOperationsInput | string
    surahId?: IntFieldUpdateOperationsInput | number
    ayahNumber?: IntFieldUpdateOperationsInput | number
    pageNumber?: IntFieldUpdateOperationsInput | number
    uthmaniText?: StringFieldUpdateOperationsInput | string
    translation?: StringFieldUpdateOperationsInput | string
    audioUrl?: StringFieldUpdateOperationsInput | string
    timestampsJson?: StringFieldUpdateOperationsInput | string
    wordsJson?: NullableStringFieldUpdateOperationsInput | string | null
    wordsSource?: StringFieldUpdateOperationsInput | string
    recitationUrl?: NullableStringFieldUpdateOperationsInput | string | null
    tafsir?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserMemoryStateCreateInput = {
    id?: string
    state: string
    intervalDays?: number
    easeFactor?: number
    repetitionCount?: number
    lapses?: number
    difficulty?: number | null
    stability?: number | null
    dueDate?: Date | string
    lastReviewedAt?: Date | string | null
    user: UserCreateNestedOneWithoutMemoryStatesInput
    verse: VerseCreateNestedOneWithoutMemoryStatesInput
  }

  export type UserMemoryStateUncheckedCreateInput = {
    id?: string
    userId: string
    verseKey: string
    state: string
    intervalDays?: number
    easeFactor?: number
    repetitionCount?: number
    lapses?: number
    difficulty?: number | null
    stability?: number | null
    dueDate?: Date | string
    lastReviewedAt?: Date | string | null
  }

  export type UserMemoryStateUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    state?: StringFieldUpdateOperationsInput | string
    intervalDays?: FloatFieldUpdateOperationsInput | number
    easeFactor?: FloatFieldUpdateOperationsInput | number
    repetitionCount?: IntFieldUpdateOperationsInput | number
    lapses?: IntFieldUpdateOperationsInput | number
    difficulty?: NullableFloatFieldUpdateOperationsInput | number | null
    stability?: NullableFloatFieldUpdateOperationsInput | number | null
    dueDate?: DateTimeFieldUpdateOperationsInput | Date | string
    lastReviewedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    user?: UserUpdateOneRequiredWithoutMemoryStatesNestedInput
    verse?: VerseUpdateOneRequiredWithoutMemoryStatesNestedInput
  }

  export type UserMemoryStateUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    verseKey?: StringFieldUpdateOperationsInput | string
    state?: StringFieldUpdateOperationsInput | string
    intervalDays?: FloatFieldUpdateOperationsInput | number
    easeFactor?: FloatFieldUpdateOperationsInput | number
    repetitionCount?: IntFieldUpdateOperationsInput | number
    lapses?: IntFieldUpdateOperationsInput | number
    difficulty?: NullableFloatFieldUpdateOperationsInput | number | null
    stability?: NullableFloatFieldUpdateOperationsInput | number | null
    dueDate?: DateTimeFieldUpdateOperationsInput | Date | string
    lastReviewedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type UserMemoryStateCreateManyInput = {
    id?: string
    userId: string
    verseKey: string
    state: string
    intervalDays?: number
    easeFactor?: number
    repetitionCount?: number
    lapses?: number
    difficulty?: number | null
    stability?: number | null
    dueDate?: Date | string
    lastReviewedAt?: Date | string | null
  }

  export type UserMemoryStateUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    state?: StringFieldUpdateOperationsInput | string
    intervalDays?: FloatFieldUpdateOperationsInput | number
    easeFactor?: FloatFieldUpdateOperationsInput | number
    repetitionCount?: IntFieldUpdateOperationsInput | number
    lapses?: IntFieldUpdateOperationsInput | number
    difficulty?: NullableFloatFieldUpdateOperationsInput | number | null
    stability?: NullableFloatFieldUpdateOperationsInput | number | null
    dueDate?: DateTimeFieldUpdateOperationsInput | Date | string
    lastReviewedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type UserMemoryStateUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    verseKey?: StringFieldUpdateOperationsInput | string
    state?: StringFieldUpdateOperationsInput | string
    intervalDays?: FloatFieldUpdateOperationsInput | number
    easeFactor?: FloatFieldUpdateOperationsInput | number
    repetitionCount?: IntFieldUpdateOperationsInput | number
    lapses?: IntFieldUpdateOperationsInput | number
    difficulty?: NullableFloatFieldUpdateOperationsInput | number | null
    stability?: NullableFloatFieldUpdateOperationsInput | number | null
    dueDate?: DateTimeFieldUpdateOperationsInput | Date | string
    lastReviewedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type RecitationAudioCreateInput = {
    id?: string
    verseKey: string
    reciterId: number
    url: string
  }

  export type RecitationAudioUncheckedCreateInput = {
    id?: string
    verseKey: string
    reciterId: number
    url: string
  }

  export type RecitationAudioUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    verseKey?: StringFieldUpdateOperationsInput | string
    reciterId?: IntFieldUpdateOperationsInput | number
    url?: StringFieldUpdateOperationsInput | string
  }

  export type RecitationAudioUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    verseKey?: StringFieldUpdateOperationsInput | string
    reciterId?: IntFieldUpdateOperationsInput | number
    url?: StringFieldUpdateOperationsInput | string
  }

  export type RecitationAudioCreateManyInput = {
    id?: string
    verseKey: string
    reciterId: number
    url: string
  }

  export type RecitationAudioUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    verseKey?: StringFieldUpdateOperationsInput | string
    reciterId?: IntFieldUpdateOperationsInput | number
    url?: StringFieldUpdateOperationsInput | string
  }

  export type RecitationAudioUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    verseKey?: StringFieldUpdateOperationsInput | string
    reciterId?: IntFieldUpdateOperationsInput | number
    url?: StringFieldUpdateOperationsInput | string
  }

  export type ReviewLogCreateInput = {
    id?: string
    grade: string
    quality: number
    intervalDays: number
    easeFactorAfter: number
    difficultyAfter?: number | null
    stabilityAfter?: number | null
    scheduler: string
    reviewDurationMs?: number
    createdAt?: Date | string
    user: UserCreateNestedOneWithoutReviewLogsInput
    verse: VerseCreateNestedOneWithoutReviewLogsInput
  }

  export type ReviewLogUncheckedCreateInput = {
    id?: string
    userId: string
    verseKey: string
    grade: string
    quality: number
    intervalDays: number
    easeFactorAfter: number
    difficultyAfter?: number | null
    stabilityAfter?: number | null
    scheduler: string
    reviewDurationMs?: number
    createdAt?: Date | string
  }

  export type ReviewLogUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    grade?: StringFieldUpdateOperationsInput | string
    quality?: IntFieldUpdateOperationsInput | number
    intervalDays?: FloatFieldUpdateOperationsInput | number
    easeFactorAfter?: FloatFieldUpdateOperationsInput | number
    difficultyAfter?: NullableFloatFieldUpdateOperationsInput | number | null
    stabilityAfter?: NullableFloatFieldUpdateOperationsInput | number | null
    scheduler?: StringFieldUpdateOperationsInput | string
    reviewDurationMs?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutReviewLogsNestedInput
    verse?: VerseUpdateOneRequiredWithoutReviewLogsNestedInput
  }

  export type ReviewLogUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    verseKey?: StringFieldUpdateOperationsInput | string
    grade?: StringFieldUpdateOperationsInput | string
    quality?: IntFieldUpdateOperationsInput | number
    intervalDays?: FloatFieldUpdateOperationsInput | number
    easeFactorAfter?: FloatFieldUpdateOperationsInput | number
    difficultyAfter?: NullableFloatFieldUpdateOperationsInput | number | null
    stabilityAfter?: NullableFloatFieldUpdateOperationsInput | number | null
    scheduler?: StringFieldUpdateOperationsInput | string
    reviewDurationMs?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ReviewLogCreateManyInput = {
    id?: string
    userId: string
    verseKey: string
    grade: string
    quality: number
    intervalDays: number
    easeFactorAfter: number
    difficultyAfter?: number | null
    stabilityAfter?: number | null
    scheduler: string
    reviewDurationMs?: number
    createdAt?: Date | string
  }

  export type ReviewLogUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    grade?: StringFieldUpdateOperationsInput | string
    quality?: IntFieldUpdateOperationsInput | number
    intervalDays?: FloatFieldUpdateOperationsInput | number
    easeFactorAfter?: FloatFieldUpdateOperationsInput | number
    difficultyAfter?: NullableFloatFieldUpdateOperationsInput | number | null
    stabilityAfter?: NullableFloatFieldUpdateOperationsInput | number | null
    scheduler?: StringFieldUpdateOperationsInput | string
    reviewDurationMs?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ReviewLogUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    verseKey?: StringFieldUpdateOperationsInput | string
    grade?: StringFieldUpdateOperationsInput | string
    quality?: IntFieldUpdateOperationsInput | number
    intervalDays?: FloatFieldUpdateOperationsInput | number
    easeFactorAfter?: FloatFieldUpdateOperationsInput | number
    difficultyAfter?: NullableFloatFieldUpdateOperationsInput | number | null
    stabilityAfter?: NullableFloatFieldUpdateOperationsInput | number | null
    scheduler?: StringFieldUpdateOperationsInput | string
    reviewDurationMs?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type FloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type SessionListRelationFilter = {
    every?: SessionWhereInput
    some?: SessionWhereInput
    none?: SessionWhereInput
  }

  export type UserMemoryStateListRelationFilter = {
    every?: UserMemoryStateWhereInput
    some?: UserMemoryStateWhereInput
    none?: UserMemoryStateWhereInput
  }

  export type ReviewLogListRelationFilter = {
    every?: ReviewLogWhereInput
    some?: ReviewLogWhereInput
    none?: ReviewLogWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type SessionOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type UserMemoryStateOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type ReviewLogOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type UserCountOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    passwordHash?: SortOrder
    createdAt?: SortOrder
    dailyTargetCount?: SortOrder
    currentStreak?: SortOrder
    longestStreak?: SortOrder
    lastActiveDate?: SortOrder
    scheduler?: SortOrder
    requestRetention?: SortOrder
  }

  export type UserAvgOrderByAggregateInput = {
    dailyTargetCount?: SortOrder
    currentStreak?: SortOrder
    longestStreak?: SortOrder
    requestRetention?: SortOrder
  }

  export type UserMaxOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    passwordHash?: SortOrder
    createdAt?: SortOrder
    dailyTargetCount?: SortOrder
    currentStreak?: SortOrder
    longestStreak?: SortOrder
    lastActiveDate?: SortOrder
    scheduler?: SortOrder
    requestRetention?: SortOrder
  }

  export type UserMinOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    passwordHash?: SortOrder
    createdAt?: SortOrder
    dailyTargetCount?: SortOrder
    currentStreak?: SortOrder
    longestStreak?: SortOrder
    lastActiveDate?: SortOrder
    scheduler?: SortOrder
    requestRetention?: SortOrder
  }

  export type UserSumOrderByAggregateInput = {
    dailyTargetCount?: SortOrder
    currentStreak?: SortOrder
    longestStreak?: SortOrder
    requestRetention?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type FloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedFloatFilter<$PrismaModel>
    _min?: NestedFloatFilter<$PrismaModel>
    _max?: NestedFloatFilter<$PrismaModel>
  }

  export type UserScalarRelationFilter = {
    is?: UserWhereInput
    isNot?: UserWhereInput
  }

  export type SessionCountOrderByAggregateInput = {
    id?: SortOrder
    token?: SortOrder
    userId?: SortOrder
    expiresAt?: SortOrder
    createdAt?: SortOrder
  }

  export type SessionMaxOrderByAggregateInput = {
    id?: SortOrder
    token?: SortOrder
    userId?: SortOrder
    expiresAt?: SortOrder
    createdAt?: SortOrder
  }

  export type SessionMinOrderByAggregateInput = {
    id?: SortOrder
    token?: SortOrder
    userId?: SortOrder
    expiresAt?: SortOrder
    createdAt?: SortOrder
  }

  export type SurahCountOrderByAggregateInput = {
    id?: SortOrder
    nameArabic?: SortOrder
    nameSimple?: SortOrder
    englishName?: SortOrder
    revelationPlace?: SortOrder
    ayahCount?: SortOrder
  }

  export type SurahAvgOrderByAggregateInput = {
    id?: SortOrder
    ayahCount?: SortOrder
  }

  export type SurahMaxOrderByAggregateInput = {
    id?: SortOrder
    nameArabic?: SortOrder
    nameSimple?: SortOrder
    englishName?: SortOrder
    revelationPlace?: SortOrder
    ayahCount?: SortOrder
  }

  export type SurahMinOrderByAggregateInput = {
    id?: SortOrder
    nameArabic?: SortOrder
    nameSimple?: SortOrder
    englishName?: SortOrder
    revelationPlace?: SortOrder
    ayahCount?: SortOrder
  }

  export type SurahSumOrderByAggregateInput = {
    id?: SortOrder
    ayahCount?: SortOrder
  }

  export type VerseCountOrderByAggregateInput = {
    verseKey?: SortOrder
    surahId?: SortOrder
    ayahNumber?: SortOrder
    pageNumber?: SortOrder
    uthmaniText?: SortOrder
    translation?: SortOrder
    audioUrl?: SortOrder
    timestampsJson?: SortOrder
    wordsJson?: SortOrder
    wordsSource?: SortOrder
    recitationUrl?: SortOrder
    tafsir?: SortOrder
    createdAt?: SortOrder
  }

  export type VerseAvgOrderByAggregateInput = {
    surahId?: SortOrder
    ayahNumber?: SortOrder
    pageNumber?: SortOrder
  }

  export type VerseMaxOrderByAggregateInput = {
    verseKey?: SortOrder
    surahId?: SortOrder
    ayahNumber?: SortOrder
    pageNumber?: SortOrder
    uthmaniText?: SortOrder
    translation?: SortOrder
    audioUrl?: SortOrder
    timestampsJson?: SortOrder
    wordsJson?: SortOrder
    wordsSource?: SortOrder
    recitationUrl?: SortOrder
    tafsir?: SortOrder
    createdAt?: SortOrder
  }

  export type VerseMinOrderByAggregateInput = {
    verseKey?: SortOrder
    surahId?: SortOrder
    ayahNumber?: SortOrder
    pageNumber?: SortOrder
    uthmaniText?: SortOrder
    translation?: SortOrder
    audioUrl?: SortOrder
    timestampsJson?: SortOrder
    wordsJson?: SortOrder
    wordsSource?: SortOrder
    recitationUrl?: SortOrder
    tafsir?: SortOrder
    createdAt?: SortOrder
  }

  export type VerseSumOrderByAggregateInput = {
    surahId?: SortOrder
    ayahNumber?: SortOrder
    pageNumber?: SortOrder
  }

  export type FloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type VerseScalarRelationFilter = {
    is?: VerseWhereInput
    isNot?: VerseWhereInput
  }

  export type UserMemoryStateUserIdVerseKeyCompoundUniqueInput = {
    userId: string
    verseKey: string
  }

  export type UserMemoryStateCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    verseKey?: SortOrder
    state?: SortOrder
    intervalDays?: SortOrder
    easeFactor?: SortOrder
    repetitionCount?: SortOrder
    lapses?: SortOrder
    difficulty?: SortOrder
    stability?: SortOrder
    dueDate?: SortOrder
    lastReviewedAt?: SortOrder
  }

  export type UserMemoryStateAvgOrderByAggregateInput = {
    intervalDays?: SortOrder
    easeFactor?: SortOrder
    repetitionCount?: SortOrder
    lapses?: SortOrder
    difficulty?: SortOrder
    stability?: SortOrder
  }

  export type UserMemoryStateMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    verseKey?: SortOrder
    state?: SortOrder
    intervalDays?: SortOrder
    easeFactor?: SortOrder
    repetitionCount?: SortOrder
    lapses?: SortOrder
    difficulty?: SortOrder
    stability?: SortOrder
    dueDate?: SortOrder
    lastReviewedAt?: SortOrder
  }

  export type UserMemoryStateMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    verseKey?: SortOrder
    state?: SortOrder
    intervalDays?: SortOrder
    easeFactor?: SortOrder
    repetitionCount?: SortOrder
    lapses?: SortOrder
    difficulty?: SortOrder
    stability?: SortOrder
    dueDate?: SortOrder
    lastReviewedAt?: SortOrder
  }

  export type UserMemoryStateSumOrderByAggregateInput = {
    intervalDays?: SortOrder
    easeFactor?: SortOrder
    repetitionCount?: SortOrder
    lapses?: SortOrder
    difficulty?: SortOrder
    stability?: SortOrder
  }

  export type FloatNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedFloatNullableFilter<$PrismaModel>
    _min?: NestedFloatNullableFilter<$PrismaModel>
    _max?: NestedFloatNullableFilter<$PrismaModel>
  }

  export type RecitationAudioVerseKeyReciterIdCompoundUniqueInput = {
    verseKey: string
    reciterId: number
  }

  export type RecitationAudioCountOrderByAggregateInput = {
    id?: SortOrder
    verseKey?: SortOrder
    reciterId?: SortOrder
    url?: SortOrder
  }

  export type RecitationAudioAvgOrderByAggregateInput = {
    reciterId?: SortOrder
  }

  export type RecitationAudioMaxOrderByAggregateInput = {
    id?: SortOrder
    verseKey?: SortOrder
    reciterId?: SortOrder
    url?: SortOrder
  }

  export type RecitationAudioMinOrderByAggregateInput = {
    id?: SortOrder
    verseKey?: SortOrder
    reciterId?: SortOrder
    url?: SortOrder
  }

  export type RecitationAudioSumOrderByAggregateInput = {
    reciterId?: SortOrder
  }

  export type ReviewLogCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    verseKey?: SortOrder
    grade?: SortOrder
    quality?: SortOrder
    intervalDays?: SortOrder
    easeFactorAfter?: SortOrder
    difficultyAfter?: SortOrder
    stabilityAfter?: SortOrder
    scheduler?: SortOrder
    reviewDurationMs?: SortOrder
    createdAt?: SortOrder
  }

  export type ReviewLogAvgOrderByAggregateInput = {
    quality?: SortOrder
    intervalDays?: SortOrder
    easeFactorAfter?: SortOrder
    difficultyAfter?: SortOrder
    stabilityAfter?: SortOrder
    reviewDurationMs?: SortOrder
  }

  export type ReviewLogMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    verseKey?: SortOrder
    grade?: SortOrder
    quality?: SortOrder
    intervalDays?: SortOrder
    easeFactorAfter?: SortOrder
    difficultyAfter?: SortOrder
    stabilityAfter?: SortOrder
    scheduler?: SortOrder
    reviewDurationMs?: SortOrder
    createdAt?: SortOrder
  }

  export type ReviewLogMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    verseKey?: SortOrder
    grade?: SortOrder
    quality?: SortOrder
    intervalDays?: SortOrder
    easeFactorAfter?: SortOrder
    difficultyAfter?: SortOrder
    stabilityAfter?: SortOrder
    scheduler?: SortOrder
    reviewDurationMs?: SortOrder
    createdAt?: SortOrder
  }

  export type ReviewLogSumOrderByAggregateInput = {
    quality?: SortOrder
    intervalDays?: SortOrder
    easeFactorAfter?: SortOrder
    difficultyAfter?: SortOrder
    stabilityAfter?: SortOrder
    reviewDurationMs?: SortOrder
  }

  export type SessionCreateNestedManyWithoutUserInput = {
    create?: XOR<SessionCreateWithoutUserInput, SessionUncheckedCreateWithoutUserInput> | SessionCreateWithoutUserInput[] | SessionUncheckedCreateWithoutUserInput[]
    connectOrCreate?: SessionCreateOrConnectWithoutUserInput | SessionCreateOrConnectWithoutUserInput[]
    createMany?: SessionCreateManyUserInputEnvelope
    connect?: SessionWhereUniqueInput | SessionWhereUniqueInput[]
  }

  export type UserMemoryStateCreateNestedManyWithoutUserInput = {
    create?: XOR<UserMemoryStateCreateWithoutUserInput, UserMemoryStateUncheckedCreateWithoutUserInput> | UserMemoryStateCreateWithoutUserInput[] | UserMemoryStateUncheckedCreateWithoutUserInput[]
    connectOrCreate?: UserMemoryStateCreateOrConnectWithoutUserInput | UserMemoryStateCreateOrConnectWithoutUserInput[]
    createMany?: UserMemoryStateCreateManyUserInputEnvelope
    connect?: UserMemoryStateWhereUniqueInput | UserMemoryStateWhereUniqueInput[]
  }

  export type ReviewLogCreateNestedManyWithoutUserInput = {
    create?: XOR<ReviewLogCreateWithoutUserInput, ReviewLogUncheckedCreateWithoutUserInput> | ReviewLogCreateWithoutUserInput[] | ReviewLogUncheckedCreateWithoutUserInput[]
    connectOrCreate?: ReviewLogCreateOrConnectWithoutUserInput | ReviewLogCreateOrConnectWithoutUserInput[]
    createMany?: ReviewLogCreateManyUserInputEnvelope
    connect?: ReviewLogWhereUniqueInput | ReviewLogWhereUniqueInput[]
  }

  export type SessionUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<SessionCreateWithoutUserInput, SessionUncheckedCreateWithoutUserInput> | SessionCreateWithoutUserInput[] | SessionUncheckedCreateWithoutUserInput[]
    connectOrCreate?: SessionCreateOrConnectWithoutUserInput | SessionCreateOrConnectWithoutUserInput[]
    createMany?: SessionCreateManyUserInputEnvelope
    connect?: SessionWhereUniqueInput | SessionWhereUniqueInput[]
  }

  export type UserMemoryStateUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<UserMemoryStateCreateWithoutUserInput, UserMemoryStateUncheckedCreateWithoutUserInput> | UserMemoryStateCreateWithoutUserInput[] | UserMemoryStateUncheckedCreateWithoutUserInput[]
    connectOrCreate?: UserMemoryStateCreateOrConnectWithoutUserInput | UserMemoryStateCreateOrConnectWithoutUserInput[]
    createMany?: UserMemoryStateCreateManyUserInputEnvelope
    connect?: UserMemoryStateWhereUniqueInput | UserMemoryStateWhereUniqueInput[]
  }

  export type ReviewLogUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<ReviewLogCreateWithoutUserInput, ReviewLogUncheckedCreateWithoutUserInput> | ReviewLogCreateWithoutUserInput[] | ReviewLogUncheckedCreateWithoutUserInput[]
    connectOrCreate?: ReviewLogCreateOrConnectWithoutUserInput | ReviewLogCreateOrConnectWithoutUserInput[]
    createMany?: ReviewLogCreateManyUserInputEnvelope
    connect?: ReviewLogWhereUniqueInput | ReviewLogWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type FloatFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type SessionUpdateManyWithoutUserNestedInput = {
    create?: XOR<SessionCreateWithoutUserInput, SessionUncheckedCreateWithoutUserInput> | SessionCreateWithoutUserInput[] | SessionUncheckedCreateWithoutUserInput[]
    connectOrCreate?: SessionCreateOrConnectWithoutUserInput | SessionCreateOrConnectWithoutUserInput[]
    upsert?: SessionUpsertWithWhereUniqueWithoutUserInput | SessionUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: SessionCreateManyUserInputEnvelope
    set?: SessionWhereUniqueInput | SessionWhereUniqueInput[]
    disconnect?: SessionWhereUniqueInput | SessionWhereUniqueInput[]
    delete?: SessionWhereUniqueInput | SessionWhereUniqueInput[]
    connect?: SessionWhereUniqueInput | SessionWhereUniqueInput[]
    update?: SessionUpdateWithWhereUniqueWithoutUserInput | SessionUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: SessionUpdateManyWithWhereWithoutUserInput | SessionUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: SessionScalarWhereInput | SessionScalarWhereInput[]
  }

  export type UserMemoryStateUpdateManyWithoutUserNestedInput = {
    create?: XOR<UserMemoryStateCreateWithoutUserInput, UserMemoryStateUncheckedCreateWithoutUserInput> | UserMemoryStateCreateWithoutUserInput[] | UserMemoryStateUncheckedCreateWithoutUserInput[]
    connectOrCreate?: UserMemoryStateCreateOrConnectWithoutUserInput | UserMemoryStateCreateOrConnectWithoutUserInput[]
    upsert?: UserMemoryStateUpsertWithWhereUniqueWithoutUserInput | UserMemoryStateUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: UserMemoryStateCreateManyUserInputEnvelope
    set?: UserMemoryStateWhereUniqueInput | UserMemoryStateWhereUniqueInput[]
    disconnect?: UserMemoryStateWhereUniqueInput | UserMemoryStateWhereUniqueInput[]
    delete?: UserMemoryStateWhereUniqueInput | UserMemoryStateWhereUniqueInput[]
    connect?: UserMemoryStateWhereUniqueInput | UserMemoryStateWhereUniqueInput[]
    update?: UserMemoryStateUpdateWithWhereUniqueWithoutUserInput | UserMemoryStateUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: UserMemoryStateUpdateManyWithWhereWithoutUserInput | UserMemoryStateUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: UserMemoryStateScalarWhereInput | UserMemoryStateScalarWhereInput[]
  }

  export type ReviewLogUpdateManyWithoutUserNestedInput = {
    create?: XOR<ReviewLogCreateWithoutUserInput, ReviewLogUncheckedCreateWithoutUserInput> | ReviewLogCreateWithoutUserInput[] | ReviewLogUncheckedCreateWithoutUserInput[]
    connectOrCreate?: ReviewLogCreateOrConnectWithoutUserInput | ReviewLogCreateOrConnectWithoutUserInput[]
    upsert?: ReviewLogUpsertWithWhereUniqueWithoutUserInput | ReviewLogUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: ReviewLogCreateManyUserInputEnvelope
    set?: ReviewLogWhereUniqueInput | ReviewLogWhereUniqueInput[]
    disconnect?: ReviewLogWhereUniqueInput | ReviewLogWhereUniqueInput[]
    delete?: ReviewLogWhereUniqueInput | ReviewLogWhereUniqueInput[]
    connect?: ReviewLogWhereUniqueInput | ReviewLogWhereUniqueInput[]
    update?: ReviewLogUpdateWithWhereUniqueWithoutUserInput | ReviewLogUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: ReviewLogUpdateManyWithWhereWithoutUserInput | ReviewLogUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: ReviewLogScalarWhereInput | ReviewLogScalarWhereInput[]
  }

  export type SessionUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<SessionCreateWithoutUserInput, SessionUncheckedCreateWithoutUserInput> | SessionCreateWithoutUserInput[] | SessionUncheckedCreateWithoutUserInput[]
    connectOrCreate?: SessionCreateOrConnectWithoutUserInput | SessionCreateOrConnectWithoutUserInput[]
    upsert?: SessionUpsertWithWhereUniqueWithoutUserInput | SessionUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: SessionCreateManyUserInputEnvelope
    set?: SessionWhereUniqueInput | SessionWhereUniqueInput[]
    disconnect?: SessionWhereUniqueInput | SessionWhereUniqueInput[]
    delete?: SessionWhereUniqueInput | SessionWhereUniqueInput[]
    connect?: SessionWhereUniqueInput | SessionWhereUniqueInput[]
    update?: SessionUpdateWithWhereUniqueWithoutUserInput | SessionUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: SessionUpdateManyWithWhereWithoutUserInput | SessionUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: SessionScalarWhereInput | SessionScalarWhereInput[]
  }

  export type UserMemoryStateUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<UserMemoryStateCreateWithoutUserInput, UserMemoryStateUncheckedCreateWithoutUserInput> | UserMemoryStateCreateWithoutUserInput[] | UserMemoryStateUncheckedCreateWithoutUserInput[]
    connectOrCreate?: UserMemoryStateCreateOrConnectWithoutUserInput | UserMemoryStateCreateOrConnectWithoutUserInput[]
    upsert?: UserMemoryStateUpsertWithWhereUniqueWithoutUserInput | UserMemoryStateUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: UserMemoryStateCreateManyUserInputEnvelope
    set?: UserMemoryStateWhereUniqueInput | UserMemoryStateWhereUniqueInput[]
    disconnect?: UserMemoryStateWhereUniqueInput | UserMemoryStateWhereUniqueInput[]
    delete?: UserMemoryStateWhereUniqueInput | UserMemoryStateWhereUniqueInput[]
    connect?: UserMemoryStateWhereUniqueInput | UserMemoryStateWhereUniqueInput[]
    update?: UserMemoryStateUpdateWithWhereUniqueWithoutUserInput | UserMemoryStateUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: UserMemoryStateUpdateManyWithWhereWithoutUserInput | UserMemoryStateUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: UserMemoryStateScalarWhereInput | UserMemoryStateScalarWhereInput[]
  }

  export type ReviewLogUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<ReviewLogCreateWithoutUserInput, ReviewLogUncheckedCreateWithoutUserInput> | ReviewLogCreateWithoutUserInput[] | ReviewLogUncheckedCreateWithoutUserInput[]
    connectOrCreate?: ReviewLogCreateOrConnectWithoutUserInput | ReviewLogCreateOrConnectWithoutUserInput[]
    upsert?: ReviewLogUpsertWithWhereUniqueWithoutUserInput | ReviewLogUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: ReviewLogCreateManyUserInputEnvelope
    set?: ReviewLogWhereUniqueInput | ReviewLogWhereUniqueInput[]
    disconnect?: ReviewLogWhereUniqueInput | ReviewLogWhereUniqueInput[]
    delete?: ReviewLogWhereUniqueInput | ReviewLogWhereUniqueInput[]
    connect?: ReviewLogWhereUniqueInput | ReviewLogWhereUniqueInput[]
    update?: ReviewLogUpdateWithWhereUniqueWithoutUserInput | ReviewLogUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: ReviewLogUpdateManyWithWhereWithoutUserInput | ReviewLogUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: ReviewLogScalarWhereInput | ReviewLogScalarWhereInput[]
  }

  export type UserCreateNestedOneWithoutSessionsInput = {
    create?: XOR<UserCreateWithoutSessionsInput, UserUncheckedCreateWithoutSessionsInput>
    connectOrCreate?: UserCreateOrConnectWithoutSessionsInput
    connect?: UserWhereUniqueInput
  }

  export type UserUpdateOneRequiredWithoutSessionsNestedInput = {
    create?: XOR<UserCreateWithoutSessionsInput, UserUncheckedCreateWithoutSessionsInput>
    connectOrCreate?: UserCreateOrConnectWithoutSessionsInput
    upsert?: UserUpsertWithoutSessionsInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutSessionsInput, UserUpdateWithoutSessionsInput>, UserUncheckedUpdateWithoutSessionsInput>
  }

  export type UserMemoryStateCreateNestedManyWithoutVerseInput = {
    create?: XOR<UserMemoryStateCreateWithoutVerseInput, UserMemoryStateUncheckedCreateWithoutVerseInput> | UserMemoryStateCreateWithoutVerseInput[] | UserMemoryStateUncheckedCreateWithoutVerseInput[]
    connectOrCreate?: UserMemoryStateCreateOrConnectWithoutVerseInput | UserMemoryStateCreateOrConnectWithoutVerseInput[]
    createMany?: UserMemoryStateCreateManyVerseInputEnvelope
    connect?: UserMemoryStateWhereUniqueInput | UserMemoryStateWhereUniqueInput[]
  }

  export type ReviewLogCreateNestedManyWithoutVerseInput = {
    create?: XOR<ReviewLogCreateWithoutVerseInput, ReviewLogUncheckedCreateWithoutVerseInput> | ReviewLogCreateWithoutVerseInput[] | ReviewLogUncheckedCreateWithoutVerseInput[]
    connectOrCreate?: ReviewLogCreateOrConnectWithoutVerseInput | ReviewLogCreateOrConnectWithoutVerseInput[]
    createMany?: ReviewLogCreateManyVerseInputEnvelope
    connect?: ReviewLogWhereUniqueInput | ReviewLogWhereUniqueInput[]
  }

  export type UserMemoryStateUncheckedCreateNestedManyWithoutVerseInput = {
    create?: XOR<UserMemoryStateCreateWithoutVerseInput, UserMemoryStateUncheckedCreateWithoutVerseInput> | UserMemoryStateCreateWithoutVerseInput[] | UserMemoryStateUncheckedCreateWithoutVerseInput[]
    connectOrCreate?: UserMemoryStateCreateOrConnectWithoutVerseInput | UserMemoryStateCreateOrConnectWithoutVerseInput[]
    createMany?: UserMemoryStateCreateManyVerseInputEnvelope
    connect?: UserMemoryStateWhereUniqueInput | UserMemoryStateWhereUniqueInput[]
  }

  export type ReviewLogUncheckedCreateNestedManyWithoutVerseInput = {
    create?: XOR<ReviewLogCreateWithoutVerseInput, ReviewLogUncheckedCreateWithoutVerseInput> | ReviewLogCreateWithoutVerseInput[] | ReviewLogUncheckedCreateWithoutVerseInput[]
    connectOrCreate?: ReviewLogCreateOrConnectWithoutVerseInput | ReviewLogCreateOrConnectWithoutVerseInput[]
    createMany?: ReviewLogCreateManyVerseInputEnvelope
    connect?: ReviewLogWhereUniqueInput | ReviewLogWhereUniqueInput[]
  }

  export type UserMemoryStateUpdateManyWithoutVerseNestedInput = {
    create?: XOR<UserMemoryStateCreateWithoutVerseInput, UserMemoryStateUncheckedCreateWithoutVerseInput> | UserMemoryStateCreateWithoutVerseInput[] | UserMemoryStateUncheckedCreateWithoutVerseInput[]
    connectOrCreate?: UserMemoryStateCreateOrConnectWithoutVerseInput | UserMemoryStateCreateOrConnectWithoutVerseInput[]
    upsert?: UserMemoryStateUpsertWithWhereUniqueWithoutVerseInput | UserMemoryStateUpsertWithWhereUniqueWithoutVerseInput[]
    createMany?: UserMemoryStateCreateManyVerseInputEnvelope
    set?: UserMemoryStateWhereUniqueInput | UserMemoryStateWhereUniqueInput[]
    disconnect?: UserMemoryStateWhereUniqueInput | UserMemoryStateWhereUniqueInput[]
    delete?: UserMemoryStateWhereUniqueInput | UserMemoryStateWhereUniqueInput[]
    connect?: UserMemoryStateWhereUniqueInput | UserMemoryStateWhereUniqueInput[]
    update?: UserMemoryStateUpdateWithWhereUniqueWithoutVerseInput | UserMemoryStateUpdateWithWhereUniqueWithoutVerseInput[]
    updateMany?: UserMemoryStateUpdateManyWithWhereWithoutVerseInput | UserMemoryStateUpdateManyWithWhereWithoutVerseInput[]
    deleteMany?: UserMemoryStateScalarWhereInput | UserMemoryStateScalarWhereInput[]
  }

  export type ReviewLogUpdateManyWithoutVerseNestedInput = {
    create?: XOR<ReviewLogCreateWithoutVerseInput, ReviewLogUncheckedCreateWithoutVerseInput> | ReviewLogCreateWithoutVerseInput[] | ReviewLogUncheckedCreateWithoutVerseInput[]
    connectOrCreate?: ReviewLogCreateOrConnectWithoutVerseInput | ReviewLogCreateOrConnectWithoutVerseInput[]
    upsert?: ReviewLogUpsertWithWhereUniqueWithoutVerseInput | ReviewLogUpsertWithWhereUniqueWithoutVerseInput[]
    createMany?: ReviewLogCreateManyVerseInputEnvelope
    set?: ReviewLogWhereUniqueInput | ReviewLogWhereUniqueInput[]
    disconnect?: ReviewLogWhereUniqueInput | ReviewLogWhereUniqueInput[]
    delete?: ReviewLogWhereUniqueInput | ReviewLogWhereUniqueInput[]
    connect?: ReviewLogWhereUniqueInput | ReviewLogWhereUniqueInput[]
    update?: ReviewLogUpdateWithWhereUniqueWithoutVerseInput | ReviewLogUpdateWithWhereUniqueWithoutVerseInput[]
    updateMany?: ReviewLogUpdateManyWithWhereWithoutVerseInput | ReviewLogUpdateManyWithWhereWithoutVerseInput[]
    deleteMany?: ReviewLogScalarWhereInput | ReviewLogScalarWhereInput[]
  }

  export type UserMemoryStateUncheckedUpdateManyWithoutVerseNestedInput = {
    create?: XOR<UserMemoryStateCreateWithoutVerseInput, UserMemoryStateUncheckedCreateWithoutVerseInput> | UserMemoryStateCreateWithoutVerseInput[] | UserMemoryStateUncheckedCreateWithoutVerseInput[]
    connectOrCreate?: UserMemoryStateCreateOrConnectWithoutVerseInput | UserMemoryStateCreateOrConnectWithoutVerseInput[]
    upsert?: UserMemoryStateUpsertWithWhereUniqueWithoutVerseInput | UserMemoryStateUpsertWithWhereUniqueWithoutVerseInput[]
    createMany?: UserMemoryStateCreateManyVerseInputEnvelope
    set?: UserMemoryStateWhereUniqueInput | UserMemoryStateWhereUniqueInput[]
    disconnect?: UserMemoryStateWhereUniqueInput | UserMemoryStateWhereUniqueInput[]
    delete?: UserMemoryStateWhereUniqueInput | UserMemoryStateWhereUniqueInput[]
    connect?: UserMemoryStateWhereUniqueInput | UserMemoryStateWhereUniqueInput[]
    update?: UserMemoryStateUpdateWithWhereUniqueWithoutVerseInput | UserMemoryStateUpdateWithWhereUniqueWithoutVerseInput[]
    updateMany?: UserMemoryStateUpdateManyWithWhereWithoutVerseInput | UserMemoryStateUpdateManyWithWhereWithoutVerseInput[]
    deleteMany?: UserMemoryStateScalarWhereInput | UserMemoryStateScalarWhereInput[]
  }

  export type ReviewLogUncheckedUpdateManyWithoutVerseNestedInput = {
    create?: XOR<ReviewLogCreateWithoutVerseInput, ReviewLogUncheckedCreateWithoutVerseInput> | ReviewLogCreateWithoutVerseInput[] | ReviewLogUncheckedCreateWithoutVerseInput[]
    connectOrCreate?: ReviewLogCreateOrConnectWithoutVerseInput | ReviewLogCreateOrConnectWithoutVerseInput[]
    upsert?: ReviewLogUpsertWithWhereUniqueWithoutVerseInput | ReviewLogUpsertWithWhereUniqueWithoutVerseInput[]
    createMany?: ReviewLogCreateManyVerseInputEnvelope
    set?: ReviewLogWhereUniqueInput | ReviewLogWhereUniqueInput[]
    disconnect?: ReviewLogWhereUniqueInput | ReviewLogWhereUniqueInput[]
    delete?: ReviewLogWhereUniqueInput | ReviewLogWhereUniqueInput[]
    connect?: ReviewLogWhereUniqueInput | ReviewLogWhereUniqueInput[]
    update?: ReviewLogUpdateWithWhereUniqueWithoutVerseInput | ReviewLogUpdateWithWhereUniqueWithoutVerseInput[]
    updateMany?: ReviewLogUpdateManyWithWhereWithoutVerseInput | ReviewLogUpdateManyWithWhereWithoutVerseInput[]
    deleteMany?: ReviewLogScalarWhereInput | ReviewLogScalarWhereInput[]
  }

  export type UserCreateNestedOneWithoutMemoryStatesInput = {
    create?: XOR<UserCreateWithoutMemoryStatesInput, UserUncheckedCreateWithoutMemoryStatesInput>
    connectOrCreate?: UserCreateOrConnectWithoutMemoryStatesInput
    connect?: UserWhereUniqueInput
  }

  export type VerseCreateNestedOneWithoutMemoryStatesInput = {
    create?: XOR<VerseCreateWithoutMemoryStatesInput, VerseUncheckedCreateWithoutMemoryStatesInput>
    connectOrCreate?: VerseCreateOrConnectWithoutMemoryStatesInput
    connect?: VerseWhereUniqueInput
  }

  export type NullableFloatFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type UserUpdateOneRequiredWithoutMemoryStatesNestedInput = {
    create?: XOR<UserCreateWithoutMemoryStatesInput, UserUncheckedCreateWithoutMemoryStatesInput>
    connectOrCreate?: UserCreateOrConnectWithoutMemoryStatesInput
    upsert?: UserUpsertWithoutMemoryStatesInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutMemoryStatesInput, UserUpdateWithoutMemoryStatesInput>, UserUncheckedUpdateWithoutMemoryStatesInput>
  }

  export type VerseUpdateOneRequiredWithoutMemoryStatesNestedInput = {
    create?: XOR<VerseCreateWithoutMemoryStatesInput, VerseUncheckedCreateWithoutMemoryStatesInput>
    connectOrCreate?: VerseCreateOrConnectWithoutMemoryStatesInput
    upsert?: VerseUpsertWithoutMemoryStatesInput
    connect?: VerseWhereUniqueInput
    update?: XOR<XOR<VerseUpdateToOneWithWhereWithoutMemoryStatesInput, VerseUpdateWithoutMemoryStatesInput>, VerseUncheckedUpdateWithoutMemoryStatesInput>
  }

  export type UserCreateNestedOneWithoutReviewLogsInput = {
    create?: XOR<UserCreateWithoutReviewLogsInput, UserUncheckedCreateWithoutReviewLogsInput>
    connectOrCreate?: UserCreateOrConnectWithoutReviewLogsInput
    connect?: UserWhereUniqueInput
  }

  export type VerseCreateNestedOneWithoutReviewLogsInput = {
    create?: XOR<VerseCreateWithoutReviewLogsInput, VerseUncheckedCreateWithoutReviewLogsInput>
    connectOrCreate?: VerseCreateOrConnectWithoutReviewLogsInput
    connect?: VerseWhereUniqueInput
  }

  export type UserUpdateOneRequiredWithoutReviewLogsNestedInput = {
    create?: XOR<UserCreateWithoutReviewLogsInput, UserUncheckedCreateWithoutReviewLogsInput>
    connectOrCreate?: UserCreateOrConnectWithoutReviewLogsInput
    upsert?: UserUpsertWithoutReviewLogsInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutReviewLogsInput, UserUpdateWithoutReviewLogsInput>, UserUncheckedUpdateWithoutReviewLogsInput>
  }

  export type VerseUpdateOneRequiredWithoutReviewLogsNestedInput = {
    create?: XOR<VerseCreateWithoutReviewLogsInput, VerseUncheckedCreateWithoutReviewLogsInput>
    connectOrCreate?: VerseCreateOrConnectWithoutReviewLogsInput
    upsert?: VerseUpsertWithoutReviewLogsInput
    connect?: VerseWhereUniqueInput
    update?: XOR<XOR<VerseUpdateToOneWithWhereWithoutReviewLogsInput, VerseUpdateWithoutReviewLogsInput>, VerseUncheckedUpdateWithoutReviewLogsInput>
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type NestedFloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedFloatFilter<$PrismaModel>
    _min?: NestedFloatFilter<$PrismaModel>
    _max?: NestedFloatFilter<$PrismaModel>
  }

  export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type NestedFloatNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedFloatNullableFilter<$PrismaModel>
    _min?: NestedFloatNullableFilter<$PrismaModel>
    _max?: NestedFloatNullableFilter<$PrismaModel>
  }

  export type SessionCreateWithoutUserInput = {
    id?: string
    token: string
    expiresAt: Date | string
    createdAt?: Date | string
  }

  export type SessionUncheckedCreateWithoutUserInput = {
    id?: string
    token: string
    expiresAt: Date | string
    createdAt?: Date | string
  }

  export type SessionCreateOrConnectWithoutUserInput = {
    where: SessionWhereUniqueInput
    create: XOR<SessionCreateWithoutUserInput, SessionUncheckedCreateWithoutUserInput>
  }

  export type SessionCreateManyUserInputEnvelope = {
    data: SessionCreateManyUserInput | SessionCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type UserMemoryStateCreateWithoutUserInput = {
    id?: string
    state: string
    intervalDays?: number
    easeFactor?: number
    repetitionCount?: number
    lapses?: number
    difficulty?: number | null
    stability?: number | null
    dueDate?: Date | string
    lastReviewedAt?: Date | string | null
    verse: VerseCreateNestedOneWithoutMemoryStatesInput
  }

  export type UserMemoryStateUncheckedCreateWithoutUserInput = {
    id?: string
    verseKey: string
    state: string
    intervalDays?: number
    easeFactor?: number
    repetitionCount?: number
    lapses?: number
    difficulty?: number | null
    stability?: number | null
    dueDate?: Date | string
    lastReviewedAt?: Date | string | null
  }

  export type UserMemoryStateCreateOrConnectWithoutUserInput = {
    where: UserMemoryStateWhereUniqueInput
    create: XOR<UserMemoryStateCreateWithoutUserInput, UserMemoryStateUncheckedCreateWithoutUserInput>
  }

  export type UserMemoryStateCreateManyUserInputEnvelope = {
    data: UserMemoryStateCreateManyUserInput | UserMemoryStateCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type ReviewLogCreateWithoutUserInput = {
    id?: string
    grade: string
    quality: number
    intervalDays: number
    easeFactorAfter: number
    difficultyAfter?: number | null
    stabilityAfter?: number | null
    scheduler: string
    reviewDurationMs?: number
    createdAt?: Date | string
    verse: VerseCreateNestedOneWithoutReviewLogsInput
  }

  export type ReviewLogUncheckedCreateWithoutUserInput = {
    id?: string
    verseKey: string
    grade: string
    quality: number
    intervalDays: number
    easeFactorAfter: number
    difficultyAfter?: number | null
    stabilityAfter?: number | null
    scheduler: string
    reviewDurationMs?: number
    createdAt?: Date | string
  }

  export type ReviewLogCreateOrConnectWithoutUserInput = {
    where: ReviewLogWhereUniqueInput
    create: XOR<ReviewLogCreateWithoutUserInput, ReviewLogUncheckedCreateWithoutUserInput>
  }

  export type ReviewLogCreateManyUserInputEnvelope = {
    data: ReviewLogCreateManyUserInput | ReviewLogCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type SessionUpsertWithWhereUniqueWithoutUserInput = {
    where: SessionWhereUniqueInput
    update: XOR<SessionUpdateWithoutUserInput, SessionUncheckedUpdateWithoutUserInput>
    create: XOR<SessionCreateWithoutUserInput, SessionUncheckedCreateWithoutUserInput>
  }

  export type SessionUpdateWithWhereUniqueWithoutUserInput = {
    where: SessionWhereUniqueInput
    data: XOR<SessionUpdateWithoutUserInput, SessionUncheckedUpdateWithoutUserInput>
  }

  export type SessionUpdateManyWithWhereWithoutUserInput = {
    where: SessionScalarWhereInput
    data: XOR<SessionUpdateManyMutationInput, SessionUncheckedUpdateManyWithoutUserInput>
  }

  export type SessionScalarWhereInput = {
    AND?: SessionScalarWhereInput | SessionScalarWhereInput[]
    OR?: SessionScalarWhereInput[]
    NOT?: SessionScalarWhereInput | SessionScalarWhereInput[]
    id?: StringFilter<"Session"> | string
    token?: StringFilter<"Session"> | string
    userId?: StringFilter<"Session"> | string
    expiresAt?: DateTimeFilter<"Session"> | Date | string
    createdAt?: DateTimeFilter<"Session"> | Date | string
  }

  export type UserMemoryStateUpsertWithWhereUniqueWithoutUserInput = {
    where: UserMemoryStateWhereUniqueInput
    update: XOR<UserMemoryStateUpdateWithoutUserInput, UserMemoryStateUncheckedUpdateWithoutUserInput>
    create: XOR<UserMemoryStateCreateWithoutUserInput, UserMemoryStateUncheckedCreateWithoutUserInput>
  }

  export type UserMemoryStateUpdateWithWhereUniqueWithoutUserInput = {
    where: UserMemoryStateWhereUniqueInput
    data: XOR<UserMemoryStateUpdateWithoutUserInput, UserMemoryStateUncheckedUpdateWithoutUserInput>
  }

  export type UserMemoryStateUpdateManyWithWhereWithoutUserInput = {
    where: UserMemoryStateScalarWhereInput
    data: XOR<UserMemoryStateUpdateManyMutationInput, UserMemoryStateUncheckedUpdateManyWithoutUserInput>
  }

  export type UserMemoryStateScalarWhereInput = {
    AND?: UserMemoryStateScalarWhereInput | UserMemoryStateScalarWhereInput[]
    OR?: UserMemoryStateScalarWhereInput[]
    NOT?: UserMemoryStateScalarWhereInput | UserMemoryStateScalarWhereInput[]
    id?: StringFilter<"UserMemoryState"> | string
    userId?: StringFilter<"UserMemoryState"> | string
    verseKey?: StringFilter<"UserMemoryState"> | string
    state?: StringFilter<"UserMemoryState"> | string
    intervalDays?: FloatFilter<"UserMemoryState"> | number
    easeFactor?: FloatFilter<"UserMemoryState"> | number
    repetitionCount?: IntFilter<"UserMemoryState"> | number
    lapses?: IntFilter<"UserMemoryState"> | number
    difficulty?: FloatNullableFilter<"UserMemoryState"> | number | null
    stability?: FloatNullableFilter<"UserMemoryState"> | number | null
    dueDate?: DateTimeFilter<"UserMemoryState"> | Date | string
    lastReviewedAt?: DateTimeNullableFilter<"UserMemoryState"> | Date | string | null
  }

  export type ReviewLogUpsertWithWhereUniqueWithoutUserInput = {
    where: ReviewLogWhereUniqueInput
    update: XOR<ReviewLogUpdateWithoutUserInput, ReviewLogUncheckedUpdateWithoutUserInput>
    create: XOR<ReviewLogCreateWithoutUserInput, ReviewLogUncheckedCreateWithoutUserInput>
  }

  export type ReviewLogUpdateWithWhereUniqueWithoutUserInput = {
    where: ReviewLogWhereUniqueInput
    data: XOR<ReviewLogUpdateWithoutUserInput, ReviewLogUncheckedUpdateWithoutUserInput>
  }

  export type ReviewLogUpdateManyWithWhereWithoutUserInput = {
    where: ReviewLogScalarWhereInput
    data: XOR<ReviewLogUpdateManyMutationInput, ReviewLogUncheckedUpdateManyWithoutUserInput>
  }

  export type ReviewLogScalarWhereInput = {
    AND?: ReviewLogScalarWhereInput | ReviewLogScalarWhereInput[]
    OR?: ReviewLogScalarWhereInput[]
    NOT?: ReviewLogScalarWhereInput | ReviewLogScalarWhereInput[]
    id?: StringFilter<"ReviewLog"> | string
    userId?: StringFilter<"ReviewLog"> | string
    verseKey?: StringFilter<"ReviewLog"> | string
    grade?: StringFilter<"ReviewLog"> | string
    quality?: IntFilter<"ReviewLog"> | number
    intervalDays?: FloatFilter<"ReviewLog"> | number
    easeFactorAfter?: FloatFilter<"ReviewLog"> | number
    difficultyAfter?: FloatNullableFilter<"ReviewLog"> | number | null
    stabilityAfter?: FloatNullableFilter<"ReviewLog"> | number | null
    scheduler?: StringFilter<"ReviewLog"> | string
    reviewDurationMs?: IntFilter<"ReviewLog"> | number
    createdAt?: DateTimeFilter<"ReviewLog"> | Date | string
  }

  export type UserCreateWithoutSessionsInput = {
    id?: string
    email: string
    passwordHash?: string | null
    createdAt?: Date | string
    dailyTargetCount?: number
    currentStreak?: number
    longestStreak?: number
    lastActiveDate?: Date | string | null
    scheduler?: string
    requestRetention?: number
    memoryStates?: UserMemoryStateCreateNestedManyWithoutUserInput
    reviewLogs?: ReviewLogCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutSessionsInput = {
    id?: string
    email: string
    passwordHash?: string | null
    createdAt?: Date | string
    dailyTargetCount?: number
    currentStreak?: number
    longestStreak?: number
    lastActiveDate?: Date | string | null
    scheduler?: string
    requestRetention?: number
    memoryStates?: UserMemoryStateUncheckedCreateNestedManyWithoutUserInput
    reviewLogs?: ReviewLogUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutSessionsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutSessionsInput, UserUncheckedCreateWithoutSessionsInput>
  }

  export type UserUpsertWithoutSessionsInput = {
    update: XOR<UserUpdateWithoutSessionsInput, UserUncheckedUpdateWithoutSessionsInput>
    create: XOR<UserCreateWithoutSessionsInput, UserUncheckedCreateWithoutSessionsInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutSessionsInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutSessionsInput, UserUncheckedUpdateWithoutSessionsInput>
  }

  export type UserUpdateWithoutSessionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    dailyTargetCount?: IntFieldUpdateOperationsInput | number
    currentStreak?: IntFieldUpdateOperationsInput | number
    longestStreak?: IntFieldUpdateOperationsInput | number
    lastActiveDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    scheduler?: StringFieldUpdateOperationsInput | string
    requestRetention?: FloatFieldUpdateOperationsInput | number
    memoryStates?: UserMemoryStateUpdateManyWithoutUserNestedInput
    reviewLogs?: ReviewLogUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutSessionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    dailyTargetCount?: IntFieldUpdateOperationsInput | number
    currentStreak?: IntFieldUpdateOperationsInput | number
    longestStreak?: IntFieldUpdateOperationsInput | number
    lastActiveDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    scheduler?: StringFieldUpdateOperationsInput | string
    requestRetention?: FloatFieldUpdateOperationsInput | number
    memoryStates?: UserMemoryStateUncheckedUpdateManyWithoutUserNestedInput
    reviewLogs?: ReviewLogUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserMemoryStateCreateWithoutVerseInput = {
    id?: string
    state: string
    intervalDays?: number
    easeFactor?: number
    repetitionCount?: number
    lapses?: number
    difficulty?: number | null
    stability?: number | null
    dueDate?: Date | string
    lastReviewedAt?: Date | string | null
    user: UserCreateNestedOneWithoutMemoryStatesInput
  }

  export type UserMemoryStateUncheckedCreateWithoutVerseInput = {
    id?: string
    userId: string
    state: string
    intervalDays?: number
    easeFactor?: number
    repetitionCount?: number
    lapses?: number
    difficulty?: number | null
    stability?: number | null
    dueDate?: Date | string
    lastReviewedAt?: Date | string | null
  }

  export type UserMemoryStateCreateOrConnectWithoutVerseInput = {
    where: UserMemoryStateWhereUniqueInput
    create: XOR<UserMemoryStateCreateWithoutVerseInput, UserMemoryStateUncheckedCreateWithoutVerseInput>
  }

  export type UserMemoryStateCreateManyVerseInputEnvelope = {
    data: UserMemoryStateCreateManyVerseInput | UserMemoryStateCreateManyVerseInput[]
    skipDuplicates?: boolean
  }

  export type ReviewLogCreateWithoutVerseInput = {
    id?: string
    grade: string
    quality: number
    intervalDays: number
    easeFactorAfter: number
    difficultyAfter?: number | null
    stabilityAfter?: number | null
    scheduler: string
    reviewDurationMs?: number
    createdAt?: Date | string
    user: UserCreateNestedOneWithoutReviewLogsInput
  }

  export type ReviewLogUncheckedCreateWithoutVerseInput = {
    id?: string
    userId: string
    grade: string
    quality: number
    intervalDays: number
    easeFactorAfter: number
    difficultyAfter?: number | null
    stabilityAfter?: number | null
    scheduler: string
    reviewDurationMs?: number
    createdAt?: Date | string
  }

  export type ReviewLogCreateOrConnectWithoutVerseInput = {
    where: ReviewLogWhereUniqueInput
    create: XOR<ReviewLogCreateWithoutVerseInput, ReviewLogUncheckedCreateWithoutVerseInput>
  }

  export type ReviewLogCreateManyVerseInputEnvelope = {
    data: ReviewLogCreateManyVerseInput | ReviewLogCreateManyVerseInput[]
    skipDuplicates?: boolean
  }

  export type UserMemoryStateUpsertWithWhereUniqueWithoutVerseInput = {
    where: UserMemoryStateWhereUniqueInput
    update: XOR<UserMemoryStateUpdateWithoutVerseInput, UserMemoryStateUncheckedUpdateWithoutVerseInput>
    create: XOR<UserMemoryStateCreateWithoutVerseInput, UserMemoryStateUncheckedCreateWithoutVerseInput>
  }

  export type UserMemoryStateUpdateWithWhereUniqueWithoutVerseInput = {
    where: UserMemoryStateWhereUniqueInput
    data: XOR<UserMemoryStateUpdateWithoutVerseInput, UserMemoryStateUncheckedUpdateWithoutVerseInput>
  }

  export type UserMemoryStateUpdateManyWithWhereWithoutVerseInput = {
    where: UserMemoryStateScalarWhereInput
    data: XOR<UserMemoryStateUpdateManyMutationInput, UserMemoryStateUncheckedUpdateManyWithoutVerseInput>
  }

  export type ReviewLogUpsertWithWhereUniqueWithoutVerseInput = {
    where: ReviewLogWhereUniqueInput
    update: XOR<ReviewLogUpdateWithoutVerseInput, ReviewLogUncheckedUpdateWithoutVerseInput>
    create: XOR<ReviewLogCreateWithoutVerseInput, ReviewLogUncheckedCreateWithoutVerseInput>
  }

  export type ReviewLogUpdateWithWhereUniqueWithoutVerseInput = {
    where: ReviewLogWhereUniqueInput
    data: XOR<ReviewLogUpdateWithoutVerseInput, ReviewLogUncheckedUpdateWithoutVerseInput>
  }

  export type ReviewLogUpdateManyWithWhereWithoutVerseInput = {
    where: ReviewLogScalarWhereInput
    data: XOR<ReviewLogUpdateManyMutationInput, ReviewLogUncheckedUpdateManyWithoutVerseInput>
  }

  export type UserCreateWithoutMemoryStatesInput = {
    id?: string
    email: string
    passwordHash?: string | null
    createdAt?: Date | string
    dailyTargetCount?: number
    currentStreak?: number
    longestStreak?: number
    lastActiveDate?: Date | string | null
    scheduler?: string
    requestRetention?: number
    sessions?: SessionCreateNestedManyWithoutUserInput
    reviewLogs?: ReviewLogCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutMemoryStatesInput = {
    id?: string
    email: string
    passwordHash?: string | null
    createdAt?: Date | string
    dailyTargetCount?: number
    currentStreak?: number
    longestStreak?: number
    lastActiveDate?: Date | string | null
    scheduler?: string
    requestRetention?: number
    sessions?: SessionUncheckedCreateNestedManyWithoutUserInput
    reviewLogs?: ReviewLogUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutMemoryStatesInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutMemoryStatesInput, UserUncheckedCreateWithoutMemoryStatesInput>
  }

  export type VerseCreateWithoutMemoryStatesInput = {
    verseKey: string
    surahId: number
    ayahNumber: number
    pageNumber: number
    uthmaniText: string
    translation: string
    audioUrl: string
    timestampsJson: string
    wordsJson?: string | null
    wordsSource?: string
    recitationUrl?: string | null
    tafsir?: string | null
    createdAt?: Date | string
    reviewLogs?: ReviewLogCreateNestedManyWithoutVerseInput
  }

  export type VerseUncheckedCreateWithoutMemoryStatesInput = {
    verseKey: string
    surahId: number
    ayahNumber: number
    pageNumber: number
    uthmaniText: string
    translation: string
    audioUrl: string
    timestampsJson: string
    wordsJson?: string | null
    wordsSource?: string
    recitationUrl?: string | null
    tafsir?: string | null
    createdAt?: Date | string
    reviewLogs?: ReviewLogUncheckedCreateNestedManyWithoutVerseInput
  }

  export type VerseCreateOrConnectWithoutMemoryStatesInput = {
    where: VerseWhereUniqueInput
    create: XOR<VerseCreateWithoutMemoryStatesInput, VerseUncheckedCreateWithoutMemoryStatesInput>
  }

  export type UserUpsertWithoutMemoryStatesInput = {
    update: XOR<UserUpdateWithoutMemoryStatesInput, UserUncheckedUpdateWithoutMemoryStatesInput>
    create: XOR<UserCreateWithoutMemoryStatesInput, UserUncheckedCreateWithoutMemoryStatesInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutMemoryStatesInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutMemoryStatesInput, UserUncheckedUpdateWithoutMemoryStatesInput>
  }

  export type UserUpdateWithoutMemoryStatesInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    dailyTargetCount?: IntFieldUpdateOperationsInput | number
    currentStreak?: IntFieldUpdateOperationsInput | number
    longestStreak?: IntFieldUpdateOperationsInput | number
    lastActiveDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    scheduler?: StringFieldUpdateOperationsInput | string
    requestRetention?: FloatFieldUpdateOperationsInput | number
    sessions?: SessionUpdateManyWithoutUserNestedInput
    reviewLogs?: ReviewLogUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutMemoryStatesInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    dailyTargetCount?: IntFieldUpdateOperationsInput | number
    currentStreak?: IntFieldUpdateOperationsInput | number
    longestStreak?: IntFieldUpdateOperationsInput | number
    lastActiveDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    scheduler?: StringFieldUpdateOperationsInput | string
    requestRetention?: FloatFieldUpdateOperationsInput | number
    sessions?: SessionUncheckedUpdateManyWithoutUserNestedInput
    reviewLogs?: ReviewLogUncheckedUpdateManyWithoutUserNestedInput
  }

  export type VerseUpsertWithoutMemoryStatesInput = {
    update: XOR<VerseUpdateWithoutMemoryStatesInput, VerseUncheckedUpdateWithoutMemoryStatesInput>
    create: XOR<VerseCreateWithoutMemoryStatesInput, VerseUncheckedCreateWithoutMemoryStatesInput>
    where?: VerseWhereInput
  }

  export type VerseUpdateToOneWithWhereWithoutMemoryStatesInput = {
    where?: VerseWhereInput
    data: XOR<VerseUpdateWithoutMemoryStatesInput, VerseUncheckedUpdateWithoutMemoryStatesInput>
  }

  export type VerseUpdateWithoutMemoryStatesInput = {
    verseKey?: StringFieldUpdateOperationsInput | string
    surahId?: IntFieldUpdateOperationsInput | number
    ayahNumber?: IntFieldUpdateOperationsInput | number
    pageNumber?: IntFieldUpdateOperationsInput | number
    uthmaniText?: StringFieldUpdateOperationsInput | string
    translation?: StringFieldUpdateOperationsInput | string
    audioUrl?: StringFieldUpdateOperationsInput | string
    timestampsJson?: StringFieldUpdateOperationsInput | string
    wordsJson?: NullableStringFieldUpdateOperationsInput | string | null
    wordsSource?: StringFieldUpdateOperationsInput | string
    recitationUrl?: NullableStringFieldUpdateOperationsInput | string | null
    tafsir?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    reviewLogs?: ReviewLogUpdateManyWithoutVerseNestedInput
  }

  export type VerseUncheckedUpdateWithoutMemoryStatesInput = {
    verseKey?: StringFieldUpdateOperationsInput | string
    surahId?: IntFieldUpdateOperationsInput | number
    ayahNumber?: IntFieldUpdateOperationsInput | number
    pageNumber?: IntFieldUpdateOperationsInput | number
    uthmaniText?: StringFieldUpdateOperationsInput | string
    translation?: StringFieldUpdateOperationsInput | string
    audioUrl?: StringFieldUpdateOperationsInput | string
    timestampsJson?: StringFieldUpdateOperationsInput | string
    wordsJson?: NullableStringFieldUpdateOperationsInput | string | null
    wordsSource?: StringFieldUpdateOperationsInput | string
    recitationUrl?: NullableStringFieldUpdateOperationsInput | string | null
    tafsir?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    reviewLogs?: ReviewLogUncheckedUpdateManyWithoutVerseNestedInput
  }

  export type UserCreateWithoutReviewLogsInput = {
    id?: string
    email: string
    passwordHash?: string | null
    createdAt?: Date | string
    dailyTargetCount?: number
    currentStreak?: number
    longestStreak?: number
    lastActiveDate?: Date | string | null
    scheduler?: string
    requestRetention?: number
    sessions?: SessionCreateNestedManyWithoutUserInput
    memoryStates?: UserMemoryStateCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutReviewLogsInput = {
    id?: string
    email: string
    passwordHash?: string | null
    createdAt?: Date | string
    dailyTargetCount?: number
    currentStreak?: number
    longestStreak?: number
    lastActiveDate?: Date | string | null
    scheduler?: string
    requestRetention?: number
    sessions?: SessionUncheckedCreateNestedManyWithoutUserInput
    memoryStates?: UserMemoryStateUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutReviewLogsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutReviewLogsInput, UserUncheckedCreateWithoutReviewLogsInput>
  }

  export type VerseCreateWithoutReviewLogsInput = {
    verseKey: string
    surahId: number
    ayahNumber: number
    pageNumber: number
    uthmaniText: string
    translation: string
    audioUrl: string
    timestampsJson: string
    wordsJson?: string | null
    wordsSource?: string
    recitationUrl?: string | null
    tafsir?: string | null
    createdAt?: Date | string
    memoryStates?: UserMemoryStateCreateNestedManyWithoutVerseInput
  }

  export type VerseUncheckedCreateWithoutReviewLogsInput = {
    verseKey: string
    surahId: number
    ayahNumber: number
    pageNumber: number
    uthmaniText: string
    translation: string
    audioUrl: string
    timestampsJson: string
    wordsJson?: string | null
    wordsSource?: string
    recitationUrl?: string | null
    tafsir?: string | null
    createdAt?: Date | string
    memoryStates?: UserMemoryStateUncheckedCreateNestedManyWithoutVerseInput
  }

  export type VerseCreateOrConnectWithoutReviewLogsInput = {
    where: VerseWhereUniqueInput
    create: XOR<VerseCreateWithoutReviewLogsInput, VerseUncheckedCreateWithoutReviewLogsInput>
  }

  export type UserUpsertWithoutReviewLogsInput = {
    update: XOR<UserUpdateWithoutReviewLogsInput, UserUncheckedUpdateWithoutReviewLogsInput>
    create: XOR<UserCreateWithoutReviewLogsInput, UserUncheckedCreateWithoutReviewLogsInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutReviewLogsInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutReviewLogsInput, UserUncheckedUpdateWithoutReviewLogsInput>
  }

  export type UserUpdateWithoutReviewLogsInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    dailyTargetCount?: IntFieldUpdateOperationsInput | number
    currentStreak?: IntFieldUpdateOperationsInput | number
    longestStreak?: IntFieldUpdateOperationsInput | number
    lastActiveDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    scheduler?: StringFieldUpdateOperationsInput | string
    requestRetention?: FloatFieldUpdateOperationsInput | number
    sessions?: SessionUpdateManyWithoutUserNestedInput
    memoryStates?: UserMemoryStateUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutReviewLogsInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    dailyTargetCount?: IntFieldUpdateOperationsInput | number
    currentStreak?: IntFieldUpdateOperationsInput | number
    longestStreak?: IntFieldUpdateOperationsInput | number
    lastActiveDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    scheduler?: StringFieldUpdateOperationsInput | string
    requestRetention?: FloatFieldUpdateOperationsInput | number
    sessions?: SessionUncheckedUpdateManyWithoutUserNestedInput
    memoryStates?: UserMemoryStateUncheckedUpdateManyWithoutUserNestedInput
  }

  export type VerseUpsertWithoutReviewLogsInput = {
    update: XOR<VerseUpdateWithoutReviewLogsInput, VerseUncheckedUpdateWithoutReviewLogsInput>
    create: XOR<VerseCreateWithoutReviewLogsInput, VerseUncheckedCreateWithoutReviewLogsInput>
    where?: VerseWhereInput
  }

  export type VerseUpdateToOneWithWhereWithoutReviewLogsInput = {
    where?: VerseWhereInput
    data: XOR<VerseUpdateWithoutReviewLogsInput, VerseUncheckedUpdateWithoutReviewLogsInput>
  }

  export type VerseUpdateWithoutReviewLogsInput = {
    verseKey?: StringFieldUpdateOperationsInput | string
    surahId?: IntFieldUpdateOperationsInput | number
    ayahNumber?: IntFieldUpdateOperationsInput | number
    pageNumber?: IntFieldUpdateOperationsInput | number
    uthmaniText?: StringFieldUpdateOperationsInput | string
    translation?: StringFieldUpdateOperationsInput | string
    audioUrl?: StringFieldUpdateOperationsInput | string
    timestampsJson?: StringFieldUpdateOperationsInput | string
    wordsJson?: NullableStringFieldUpdateOperationsInput | string | null
    wordsSource?: StringFieldUpdateOperationsInput | string
    recitationUrl?: NullableStringFieldUpdateOperationsInput | string | null
    tafsir?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    memoryStates?: UserMemoryStateUpdateManyWithoutVerseNestedInput
  }

  export type VerseUncheckedUpdateWithoutReviewLogsInput = {
    verseKey?: StringFieldUpdateOperationsInput | string
    surahId?: IntFieldUpdateOperationsInput | number
    ayahNumber?: IntFieldUpdateOperationsInput | number
    pageNumber?: IntFieldUpdateOperationsInput | number
    uthmaniText?: StringFieldUpdateOperationsInput | string
    translation?: StringFieldUpdateOperationsInput | string
    audioUrl?: StringFieldUpdateOperationsInput | string
    timestampsJson?: StringFieldUpdateOperationsInput | string
    wordsJson?: NullableStringFieldUpdateOperationsInput | string | null
    wordsSource?: StringFieldUpdateOperationsInput | string
    recitationUrl?: NullableStringFieldUpdateOperationsInput | string | null
    tafsir?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    memoryStates?: UserMemoryStateUncheckedUpdateManyWithoutVerseNestedInput
  }

  export type SessionCreateManyUserInput = {
    id?: string
    token: string
    expiresAt: Date | string
    createdAt?: Date | string
  }

  export type UserMemoryStateCreateManyUserInput = {
    id?: string
    verseKey: string
    state: string
    intervalDays?: number
    easeFactor?: number
    repetitionCount?: number
    lapses?: number
    difficulty?: number | null
    stability?: number | null
    dueDate?: Date | string
    lastReviewedAt?: Date | string | null
  }

  export type ReviewLogCreateManyUserInput = {
    id?: string
    verseKey: string
    grade: string
    quality: number
    intervalDays: number
    easeFactorAfter: number
    difficultyAfter?: number | null
    stabilityAfter?: number | null
    scheduler: string
    reviewDurationMs?: number
    createdAt?: Date | string
  }

  export type SessionUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    token?: StringFieldUpdateOperationsInput | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SessionUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    token?: StringFieldUpdateOperationsInput | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SessionUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    token?: StringFieldUpdateOperationsInput | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserMemoryStateUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    state?: StringFieldUpdateOperationsInput | string
    intervalDays?: FloatFieldUpdateOperationsInput | number
    easeFactor?: FloatFieldUpdateOperationsInput | number
    repetitionCount?: IntFieldUpdateOperationsInput | number
    lapses?: IntFieldUpdateOperationsInput | number
    difficulty?: NullableFloatFieldUpdateOperationsInput | number | null
    stability?: NullableFloatFieldUpdateOperationsInput | number | null
    dueDate?: DateTimeFieldUpdateOperationsInput | Date | string
    lastReviewedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    verse?: VerseUpdateOneRequiredWithoutMemoryStatesNestedInput
  }

  export type UserMemoryStateUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    verseKey?: StringFieldUpdateOperationsInput | string
    state?: StringFieldUpdateOperationsInput | string
    intervalDays?: FloatFieldUpdateOperationsInput | number
    easeFactor?: FloatFieldUpdateOperationsInput | number
    repetitionCount?: IntFieldUpdateOperationsInput | number
    lapses?: IntFieldUpdateOperationsInput | number
    difficulty?: NullableFloatFieldUpdateOperationsInput | number | null
    stability?: NullableFloatFieldUpdateOperationsInput | number | null
    dueDate?: DateTimeFieldUpdateOperationsInput | Date | string
    lastReviewedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type UserMemoryStateUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    verseKey?: StringFieldUpdateOperationsInput | string
    state?: StringFieldUpdateOperationsInput | string
    intervalDays?: FloatFieldUpdateOperationsInput | number
    easeFactor?: FloatFieldUpdateOperationsInput | number
    repetitionCount?: IntFieldUpdateOperationsInput | number
    lapses?: IntFieldUpdateOperationsInput | number
    difficulty?: NullableFloatFieldUpdateOperationsInput | number | null
    stability?: NullableFloatFieldUpdateOperationsInput | number | null
    dueDate?: DateTimeFieldUpdateOperationsInput | Date | string
    lastReviewedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type ReviewLogUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    grade?: StringFieldUpdateOperationsInput | string
    quality?: IntFieldUpdateOperationsInput | number
    intervalDays?: FloatFieldUpdateOperationsInput | number
    easeFactorAfter?: FloatFieldUpdateOperationsInput | number
    difficultyAfter?: NullableFloatFieldUpdateOperationsInput | number | null
    stabilityAfter?: NullableFloatFieldUpdateOperationsInput | number | null
    scheduler?: StringFieldUpdateOperationsInput | string
    reviewDurationMs?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    verse?: VerseUpdateOneRequiredWithoutReviewLogsNestedInput
  }

  export type ReviewLogUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    verseKey?: StringFieldUpdateOperationsInput | string
    grade?: StringFieldUpdateOperationsInput | string
    quality?: IntFieldUpdateOperationsInput | number
    intervalDays?: FloatFieldUpdateOperationsInput | number
    easeFactorAfter?: FloatFieldUpdateOperationsInput | number
    difficultyAfter?: NullableFloatFieldUpdateOperationsInput | number | null
    stabilityAfter?: NullableFloatFieldUpdateOperationsInput | number | null
    scheduler?: StringFieldUpdateOperationsInput | string
    reviewDurationMs?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ReviewLogUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    verseKey?: StringFieldUpdateOperationsInput | string
    grade?: StringFieldUpdateOperationsInput | string
    quality?: IntFieldUpdateOperationsInput | number
    intervalDays?: FloatFieldUpdateOperationsInput | number
    easeFactorAfter?: FloatFieldUpdateOperationsInput | number
    difficultyAfter?: NullableFloatFieldUpdateOperationsInput | number | null
    stabilityAfter?: NullableFloatFieldUpdateOperationsInput | number | null
    scheduler?: StringFieldUpdateOperationsInput | string
    reviewDurationMs?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserMemoryStateCreateManyVerseInput = {
    id?: string
    userId: string
    state: string
    intervalDays?: number
    easeFactor?: number
    repetitionCount?: number
    lapses?: number
    difficulty?: number | null
    stability?: number | null
    dueDate?: Date | string
    lastReviewedAt?: Date | string | null
  }

  export type ReviewLogCreateManyVerseInput = {
    id?: string
    userId: string
    grade: string
    quality: number
    intervalDays: number
    easeFactorAfter: number
    difficultyAfter?: number | null
    stabilityAfter?: number | null
    scheduler: string
    reviewDurationMs?: number
    createdAt?: Date | string
  }

  export type UserMemoryStateUpdateWithoutVerseInput = {
    id?: StringFieldUpdateOperationsInput | string
    state?: StringFieldUpdateOperationsInput | string
    intervalDays?: FloatFieldUpdateOperationsInput | number
    easeFactor?: FloatFieldUpdateOperationsInput | number
    repetitionCount?: IntFieldUpdateOperationsInput | number
    lapses?: IntFieldUpdateOperationsInput | number
    difficulty?: NullableFloatFieldUpdateOperationsInput | number | null
    stability?: NullableFloatFieldUpdateOperationsInput | number | null
    dueDate?: DateTimeFieldUpdateOperationsInput | Date | string
    lastReviewedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    user?: UserUpdateOneRequiredWithoutMemoryStatesNestedInput
  }

  export type UserMemoryStateUncheckedUpdateWithoutVerseInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    state?: StringFieldUpdateOperationsInput | string
    intervalDays?: FloatFieldUpdateOperationsInput | number
    easeFactor?: FloatFieldUpdateOperationsInput | number
    repetitionCount?: IntFieldUpdateOperationsInput | number
    lapses?: IntFieldUpdateOperationsInput | number
    difficulty?: NullableFloatFieldUpdateOperationsInput | number | null
    stability?: NullableFloatFieldUpdateOperationsInput | number | null
    dueDate?: DateTimeFieldUpdateOperationsInput | Date | string
    lastReviewedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type UserMemoryStateUncheckedUpdateManyWithoutVerseInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    state?: StringFieldUpdateOperationsInput | string
    intervalDays?: FloatFieldUpdateOperationsInput | number
    easeFactor?: FloatFieldUpdateOperationsInput | number
    repetitionCount?: IntFieldUpdateOperationsInput | number
    lapses?: IntFieldUpdateOperationsInput | number
    difficulty?: NullableFloatFieldUpdateOperationsInput | number | null
    stability?: NullableFloatFieldUpdateOperationsInput | number | null
    dueDate?: DateTimeFieldUpdateOperationsInput | Date | string
    lastReviewedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type ReviewLogUpdateWithoutVerseInput = {
    id?: StringFieldUpdateOperationsInput | string
    grade?: StringFieldUpdateOperationsInput | string
    quality?: IntFieldUpdateOperationsInput | number
    intervalDays?: FloatFieldUpdateOperationsInput | number
    easeFactorAfter?: FloatFieldUpdateOperationsInput | number
    difficultyAfter?: NullableFloatFieldUpdateOperationsInput | number | null
    stabilityAfter?: NullableFloatFieldUpdateOperationsInput | number | null
    scheduler?: StringFieldUpdateOperationsInput | string
    reviewDurationMs?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutReviewLogsNestedInput
  }

  export type ReviewLogUncheckedUpdateWithoutVerseInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    grade?: StringFieldUpdateOperationsInput | string
    quality?: IntFieldUpdateOperationsInput | number
    intervalDays?: FloatFieldUpdateOperationsInput | number
    easeFactorAfter?: FloatFieldUpdateOperationsInput | number
    difficultyAfter?: NullableFloatFieldUpdateOperationsInput | number | null
    stabilityAfter?: NullableFloatFieldUpdateOperationsInput | number | null
    scheduler?: StringFieldUpdateOperationsInput | string
    reviewDurationMs?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ReviewLogUncheckedUpdateManyWithoutVerseInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    grade?: StringFieldUpdateOperationsInput | string
    quality?: IntFieldUpdateOperationsInput | number
    intervalDays?: FloatFieldUpdateOperationsInput | number
    easeFactorAfter?: FloatFieldUpdateOperationsInput | number
    difficultyAfter?: NullableFloatFieldUpdateOperationsInput | number | null
    stabilityAfter?: NullableFloatFieldUpdateOperationsInput | number | null
    scheduler?: StringFieldUpdateOperationsInput | string
    reviewDurationMs?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}
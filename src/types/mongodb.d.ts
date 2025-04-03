declare global {
  // Using interface instead of var declaration
  interface Global {
    mongoose: {
      conn: import('mongoose').Mongoose | null;
      promise: Promise<import('mongoose').Mongoose> | null;
    } | undefined;
  }
}

// This empty export is needed to make this a module
export {};
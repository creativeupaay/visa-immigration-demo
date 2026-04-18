import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI as string);
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Normalize employeeId index to avoid duplicate-null conflicts for non-admin users.
    const usersCollection = mongoose.connection.collection("users");
    const indexes = await usersCollection.indexes();
    const employeeIdIndex = indexes.find((index) => index.name === "employeeId_1");

    const hasExpectedPartialFilter =
      employeeIdIndex?.partialFilterExpression &&
      (employeeIdIndex.partialFilterExpression as Record<string, unknown>).employeeId;

    if (employeeIdIndex && !hasExpectedPartialFilter) {
      await usersCollection.dropIndex("employeeId_1");
      console.log("Dropped legacy employeeId_1 index");
    }

    if (!hasExpectedPartialFilter) {
      await usersCollection.createIndex(
        { employeeId: 1 },
        {
          name: "employeeId_1",
          unique: true,
          partialFilterExpression: { employeeId: { $type: "string" } },
        }
      );
      console.log("Created partial unique index for employeeId");
    }
  }
  catch (error) {
    if (error instanceof Error) {
      console.error(`Error: ${error.message}`);
    } else {
      console.error(`Unexpected error: ${error}`);
    }

    process.exit(1);
  }
};

export default connectDB;

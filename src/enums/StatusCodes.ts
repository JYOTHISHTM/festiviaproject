export enum StatusCodes {
  OK = 200,
  CREATED = 201,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  INTERNAL_SERVER_ERROR = 500,
}

export enum Messages {
  INTERNAL_SERVER_ERROR = "Internal server error",
  CREATOR_NOT_FOUND = "Creator not found",
  REAPPLIED_SUCCESSFULLY = "Reapplied successfully",
  FETCH_SUBSCRIPTION_ERROR = "Error fetching subscription plan",
  FETCH_PENDING_CREATORS_ERROR = "Error fetching pending creators",
}

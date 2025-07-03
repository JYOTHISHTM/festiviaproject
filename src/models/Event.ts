import mongoose, { Schema, Document } from 'mongoose';

export interface IEvent extends Document {
  eventName: string;
  eventType: string;
  description: string;
  daySelectionMode: 'single' | 'range';
  date?: Date;
  startDate?: Date;
  endDate?: Date;
  creatorId: mongoose.Types.ObjectId;
  time: string;
  location: string;
  seatType: 'GENERAL' | 'RESERVED';
  price: number;
  image: string;
  createdAt: Date;
  updatedAt: Date;
  layoutId: string;
  isListed: boolean;
  geoLocation: {
    type: 'Point';
    coordinates: [number, number];
  };


}

const EventSchema: Schema = new Schema(
  {
    eventName: { type: String, required: true },
    eventType: { type: String, required: true },
    description: { type: String, required: true },

    daySelectionMode: {
      type: String,
      enum: ['single', 'range'],
      required: true,
    },

    date: { type: Date },
    startDate: { type: Date },
    endDate: { type: Date },


    time: { type: String, required: true },
    location: { type: String, required: true },

    geoLocation: {
      type: {
        type: String,
        enum: ['Point'],
        required: true,
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },



    seatType: {
      type: String,
      required: true,
      enum: ['GENERAL', 'RESERVED']
    },
    price: {
      type: Number,
      validate: {
        validator: function (this: IEvent, v: number) {
          if (this.seatType === 'GENERAL') {
            return v != null && !isNaN(v);
          }
          return true;
        },
        message: 'Price is required for GENERAL seat type',
      },
    }, image: { type: String, required: true },


    isListed: { type: Boolean, default: true },


    layoutId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SeatLayout',
      required: function (this: IEvent) {
        return this.seatType === 'RESERVED';
      }
    },

    creatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Creator',
      required: true
    },
  },

  { timestamps: true }
);


const EventModel = mongoose.model<IEvent>("Event", EventSchema);
export default EventModel;
export { EventModel };
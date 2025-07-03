import EventProfileModel from "../../models/EventProfile";
import EventGalleryModel, { EventGallery } from "../../models/EventGallery";

export const getAllPrivateCreatorsProfile = async () => {
  return await EventProfileModel.find();
};


export const findById=async(id: string)=> {
  return EventGalleryModel.findById(id);
}

export const getAllPost = async (creatorId: string) => {
  return await EventGalleryModel.find({ creator: creatorId })
};




export const create = async (data: EventGallery) => {
  const event = new EventGalleryModel(data);
  return await event.save();
};


export const updateProfileField = async (field: string, value: any, creatorId: string) => {
  const update = { [field]: value, creator: creatorId };
  return await EventProfileModel.findOneAndUpdate(
    { creator: creatorId }, 
    update,
    { new: true, upsert: true }
  );
};


export const getProfile = async (creatorId: string) => {
  return await EventProfileModel.findOne({ creator:creatorId });
};


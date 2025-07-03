import * as repo from "../../repositories/implementation/EventProfileRepository";
import { EventGallery as EventGalleryType } from "../../models/EventGallery";


export const getAllPrivateCreatorsData = () => {
    return repo.getAllPrivateCreatorsProfile();
  };
  
  export const getAllPost = async (creatorId: string) => {
    return await repo.getAllPost(creatorId);
  };
  

  export const postEvent = (data: EventGalleryType) => {
    return repo.create(data);
  };
  

  
export const findByIdService = async (id: string) => {
  return await repo.findById(id);
};


export const updateProfile = (field: string, value: any, creatorId: string) => {
  return repo.updateProfileField(field, value, creatorId);
};

export const getProfileData = (creatorId: string) => {
  return repo.getProfile(creatorId);
};

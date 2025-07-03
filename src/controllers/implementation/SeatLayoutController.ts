import { Request, Response } from 'express';
import { SeatLayoutService } from '../../services/implementation/SeatLayoutService';
import { StatusCodes } from "../../enums/StatusCodes";

export class SeatLayoutController {
  constructor(private service: SeatLayoutService) { }

  createLayout = async (req: Request, res: Response) => {
    try {
      const { layoutType, totalSeats, price } = req.body; 
      const { creatorId } = req.params;
      if (!creatorId) {
        return res.status(StatusCodes.BAD_REQUEST).json({ message: 'creatorId is required in URL params' });
      }

      if (!layoutType || !totalSeats) {
        return res.status(StatusCodes.BAD_REQUEST).json({ message: 'layoutType and totalSeats are required in body' });
      }

      let normalPrice: number | undefined;
      let balconyPrices: { normal: number; premium: number } | undefined;
      let reclanarPrices: { reclanar: number; reclanarPlus: number } | undefined;

      if (layoutType === 'normal' || layoutType === 'centeredscreen') {
        if (typeof price !== 'number') {
          return res.status(StatusCodes.BAD_REQUEST).json({ message: 'price must be a number for this layoutType' });
        }
        normalPrice = price;
      } else if (layoutType === 'withbalcony') {
        if (
          !price ||
          typeof price.normal !== 'number' ||
          typeof price.premium !== 'number'
        ) {
          return res.status(StatusCodes.BAD_REQUEST).json({ message: 'price with normal and premium numbers is required' });
        }
        balconyPrices = price;
      } else if (layoutType === 'reclanar') {
        if (
          !price ||
          typeof price.reclanar !== 'number' ||
          typeof price.reclanarPlus !== 'number'
        ) {
          return res.status(StatusCodes.BAD_REQUEST).json({ message: 'price with reclanar and reclanarPlus numbers is required' });
        }
        reclanarPrices = price;
      }

      const layoutData = {
        layoutType,
        totalSeats,
        creatorId,
        isUsed: false,
        normalPrice,
        balconyPrices,
        reclanarPrices,
         seats: [],
      };
      console.log('layout data', layoutData);

      const layout = await this.service.createLayout(layoutData);
      res.status(StatusCodes.CREATED).json(layout);
    } catch (err) {
      console.error('Error saving layout:', err);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Failed to save layout', error: err });
    }
  };



  getLayouts = async (_: Request, res: Response) => {
    try {
      const layouts = await this.service.getAllLayouts();
      res.json(layouts);
    } catch (err) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Failed to retrieve layouts', error: err });
    }
  };

  getLayoutsByCreatorId = async (req: Request, res: Response) => {
    try {
      const { creatorId } = req.params;

      const layouts = await this.service.getLayoutsByCreatorId(creatorId);

      res.json(layouts);
    } catch (err) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Failed to retrieve layouts', error: err });
    }
  };
}

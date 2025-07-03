import { Wallet } from '../../models/Wallet';
import { Types } from 'mongoose';

class WalletRepository {

  async deductAmount(userId: string, amount: number): Promise<boolean> {
    const wallet = await Wallet.findOne({ user: userId });

    if (!wallet || wallet.balance < amount) {
      return false;
    }

    wallet.balance -= amount;
    wallet.transactions.push({
      type: 'deduct',
      amount: -amount,
      date: new Date()
    });

    await wallet.save();
    return true;
  }



  async getWalletByUserId(userId: string) {
    return await Wallet.findOne({ user: userId });
  }

  async getWalletForBooking(userId: string) {
    return await Wallet.findOne({ user: userId });
  }


  async createWallet(userId: string) {
    return await Wallet.create({
      user: userId,
      balance: 0,
      transactions: [],
    });
  }



async getWalletByCreatorId(creatorId: string) {
  return await Wallet.findOne({ creator: new Types.ObjectId(creatorId) });
}


async createWalletForCreator(creatorId: string) {
  return await Wallet.create({
    creator: new Types.ObjectId(creatorId),
    balance: 0,
    transactions: [],
  });
}



async updateWallet(userId: string, amount: number, type: 'add' | 'refund' | 'deduct') {
  const wallet = await Wallet.findOne({ user: userId });
  if (!wallet) throw new Error('Wallet not found');

  if (type === 'add' || type === 'refund') {
    wallet.balance += amount;
  } else if (type === 'deduct') {
    wallet.balance -= amount;
  }

  const now = new Date();
  const transaction = {
    type,
    amount: Math.abs(amount),
    date: now,
  };
  
  const lastTransaction = wallet.transactions[wallet.transactions.length - 1];
  
  if (lastTransaction) {
    const timeDiff = now.getTime() - new Date(lastTransaction.date).getTime();
    
    if (
      lastTransaction.type === transaction.type &&
      lastTransaction.amount === transaction.amount &&
      timeDiff <= 2000 
    ) {
      
      return wallet;
    }
  }
  
  wallet.transactions.push(transaction);
  await wallet.save();

  return wallet;
}




  async updateWalletToCreator(creatorId: string, amount: number, type: 'add' | 'refund') {
    const wallet = await Wallet.findOne({ creator: creatorId });
    if (!wallet) throw new Error('Wallet not found');

    const transaction = {
      type,
      amount: Math.abs(amount),
      date: new Date(),
    };

    wallet.balance += amount;
    wallet.transactions.push(transaction);

    await wallet.save();

    return wallet;
  }

}

export default new WalletRepository();

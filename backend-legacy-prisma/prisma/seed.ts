import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@ghanalandcommission.gov.gh' },
    update: {},
    create: {
      name: 'Ghana Land Commission',
      email: 'admin@ghanalandcommission.gov.gh',
      phoneNumber: '+233302123456',
      passwordHash: hash,
      role: 'admin',
      verificationStatus: 'verified',
      country: 'GH',
      organization: 'Ghana Land Commission',
      staffId: 'GLC-EMP-2024-001',
      blockchainToken: '0x' + 'a'.repeat(64),
      reputation: { create: { score: 98, totalTransactions: 250, successfulTransactions: 248, disputesWon: 45, communityVotes: 890 } },
      creditScore: { create: { score: 850, rating: 'Excellent', paymentHistory: 95, creditUtilization: 20, lengthOfHistory: 90, newCredit: 85, creditMix: 90 } },
      financialProfile: { create: { monthlyIncome: 12000, assets: 500000, liabilities: 50000, netWorth: 450000, bankingHistory: 15 } }
    }
  });

  const seller = await prisma.user.upsert({
    where: { email: 'john.doe@gmail.com' },
    update: {},
    create: {
      name: 'John Doe',
      email: 'john.doe@gmail.com',
      phoneNumber: '+233244123456',
      passwordHash: hash,
      role: 'seller',
      verificationStatus: 'verified',
      country: 'GH',
      blockchainToken: '0x' + 'b'.repeat(64),
      reputation: { create: { score: 92, totalTransactions: 15, successfulTransactions: 14, disputesWon: 3, communityVotes: 45 } },
      creditScore: { create: { score: 785, rating: 'Excellent', paymentHistory: 95, creditUtilization: 25, lengthOfHistory: 88, newCredit: 82, creditMix: 90 } },
      financialProfile: { create: { monthlyIncome: 8500, assets: 450000, liabilities: 125000, netWorth: 325000, bankingHistory: 12 } }
    }
  });

  const buyer = await prisma.user.upsert({
    where: { email: 'akosua.frimpong@yahoo.com' },
    update: {},
    create: {
      name: 'Akosua Frimpong',
      email: 'akosua.frimpong@yahoo.com',
      phoneNumber: '+233201987654',
      passwordHash: hash,
      role: 'buyer',
      verificationStatus: 'verified',
      country: 'GH',
      blockchainToken: '0x' + 'c'.repeat(64),
      reputation: { create: { score: 88, totalTransactions: 8, successfulTransactions: 7, disputesWon: 1, communityVotes: 32 } },
      creditScore: { create: { score: 720, rating: 'Good', paymentHistory: 88, creditUtilization: 35, lengthOfHistory: 75, newCredit: 70, creditMix: 85 } },
      financialProfile: { create: { monthlyIncome: 6200, assets: 180000, liabilities: 45000, netWorth: 135000, bankingHistory: 8 } }
    }
  });

  const arbitrator = await prisma.user.upsert({
    where: { email: 'ama.osei@arbitrator.gh' },
    update: {},
    create: {
      name: 'Dr. Ama Osei',
      email: 'ama.osei@arbitrator.gh',
      phoneNumber: '+233244567890',
      passwordHash: hash,
      role: 'arbitrator',
      verificationStatus: 'verified',
      country: 'GH',
      organization: 'Ghana Arbitration Centre',
      arbitratorRegNo: 'ARB-GH-2023-045',
      blockchainToken: '0x' + 'd'.repeat(64),
      reputation: { create: { score: 94, totalTransactions: 67, successfulTransactions: 65, disputesWon: 42, communityVotes: 156 } },
      creditScore: { create: { score: 800, rating: 'Excellent', paymentHistory: 92, creditUtilization: 22, lengthOfHistory: 90, newCredit: 80, creditMix: 88 } },
      financialProfile: { create: { monthlyIncome: 9500, assets: 280000, liabilities: 60000, netWorth: 220000, bankingHistory: 10 } }
    }
  });

  const niaOfficer = await prisma.user.upsert({
    where: { email: 'officer@nia.gov.gh' },
    update: {},
    create: {
      name: 'NIA Verification Officer',
      email: 'officer@nia.gov.gh',
      phoneNumber: '+233200000099',
      passwordHash: hash,
      role: 'nia',
      verificationStatus: 'verified',
      country: 'GH',
      organization: 'National Identification Authority',
      staffId: 'NIA-EMP-2024-010',
      reputation: { create: { score: 80, totalTransactions: 0, successfulTransactions: 0, disputesWon: 0, communityVotes: 0 } },
      creditScore: { create: { score: 700, rating: 'Good', paymentHistory: 80, creditUtilization: 30, lengthOfHistory: 70, newCredit: 65, creditMix: 75 } },
      financialProfile: { create: { monthlyIncome: 0, assets: 0, liabilities: 0, netWorth: 0, bankingHistory: 0 } }
    }
  });

  // Demo NIA employee list (HR DB substitute) for the employee verification procedure
  await prisma.nIAEmployee.upsert({
    where: { staffId: 'NIA-STAFF-0001' },
    update: {},
    create: {
      staffId: 'NIA-STAFF-0001',
      fullName: 'Ama Serwaa Owusu',
      department: 'Identity Verification',
      roleTitle: 'Senior Verification Analyst',
      active: true,
      ghanaCardNumber: 'GHA-123456789-1',
      biometricRef: crypto.createHash('sha256').update('demo-fingerprint-ama').digest('hex')
    }
  });
  await prisma.nIAEmployee.upsert({
    where: { staffId: 'NIA-STAFF-0002' },
    update: {},
    create: {
      staffId: 'NIA-STAFF-0002',
      fullName: 'Kojo Asare',
      department: 'Field Operations',
      roleTitle: 'Enrollment Officer',
      active: true,
      ghanaCardNumber: 'GHA-987654321-0',
      biometricRef: crypto.createHash('sha256').update('demo-fingerprint-kojo').digest('hex')
    }
  });
  await prisma.nIAEmployee.upsert({
    where: { staffId: 'NIA-STAFF-0003' },
    update: {},
    create: {
      staffId: 'NIA-STAFF-0003',
      fullName: 'Esi Mensima Darko',
      department: 'IT Security',
      roleTitle: 'Security Officer',
      active: false,
      ghanaCardNumber: 'GHA-000111222-3',
      biometricRef: crypto.createHash('sha256').update('demo-fingerprint-esi').digest('hex')
    }
  });

  const existingParcel = await prisma.landParcel.findFirst({ where: { title: 'Prime Residential Plot in East Legon' } });
  const parcel = existingParcel || await prisma.landParcel.create({
    data: {
      title: 'Prime Residential Plot in East Legon',
      description: 'Beautiful residential plot in the prestigious East Legon area.',
      ownerId: seller.id,
      area: 2000,
      price: 450000,
      status: 'available',
      type: 'residential',
      documentsVerificationStatus: 'verified',
      blockchainHash: '0x1a2b3c4d5e6f7890abcdef1234567890abcdef12',
      location: {
        create: {
          address: 'East Legon, Accra',
          latitude: 5.6037,
          longitude: -0.187,
          region: 'Greater Accra'
        }
      },
      documents: {
        create: [
          { name: 'Land Title Certificate', type: 'PDF', url: '/documents/land-title-001.pdf', verificationStatus: 'verified' },
          { name: 'Survey Plan', type: 'PDF', url: '/documents/survey-plan-001.pdf', verificationStatus: 'verified' }
        ]
      }
    }
  });

  console.log('Seeded:', admin.email, seller.email, buyer.email, arbitrator.email, niaOfficer.email, parcel?.title || 'parcel');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

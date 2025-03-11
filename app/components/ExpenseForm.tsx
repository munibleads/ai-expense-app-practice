"use client";

import React, { useState, memo, useCallback, useMemo, Suspense } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Skeleton from '@mui/material/Skeleton';
import Card from '@mui/material/Card';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import dynamic from 'next/dynamic';
import { BedrockService, ReceiptData } from '@/app/services/bedrockService';
import { S3Service } from '@/app/services/s3Service';
import { ReceiptService, SavedReceipt } from '@/app/services/receiptService';
import { useRouter } from 'next/navigation';
import { styled } from '@mui/material/styles';
import CircularProgress from '@mui/material/CircularProgress';
import CancelIcon from '@mui/icons-material/Cancel';
import SaveIcon from '@mui/icons-material/Save';
import { TextField, FormControl, InputLabel, InputAdornment } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import HierarchicalSelect from './common/HierarchicalSelect';
import { parseAccountData } from '@/app/utils/accountUtils';
import { format } from 'date-fns';

// Memoize the loading skeleton component
const LoadingSkeleton = memo<{ height?: number }>(({ height = 200 }) => (
  <Card sx={{ height: '100%', minHeight: height }}>
    <Box sx={{ p: 3 }}>
      <Skeleton variant="circular" width={48} height={48} sx={{ mb: 2 }} />
      <Skeleton variant="text" sx={{ fontSize: '1.5rem', mb: 2, width: '60%' }} />
      <Skeleton variant="rectangular" height={100} sx={{ mb: 2 }} />
      <Skeleton variant="text" sx={{ fontSize: '1rem', width: '40%' }} />
    </Box>
  </Card>
));

LoadingSkeleton.displayName = 'LoadingSkeleton';

// Lazy load components with Suspense boundaries
const FileUploadSection = dynamic(
  () => import('./expense/FileUploadSection').then(mod => memo(mod.default)),
  {
    loading: () => <LoadingSkeleton height={250} />,
    ssr: false
  }
);

const ReceiptDetails = dynamic(
  () => import('./expense/ReceiptDetails').then(mod => memo(mod.default)),
  {
    loading: () => <LoadingSkeleton height={400} />,
    ssr: false
  }
);

const ExpenseLineItems = dynamic(
  () => import('./expense/ExpenseLineItems').then(mod => memo(mod.default)),
  {
    loading: () => <LoadingSkeleton height={400} />,
    ssr: false
  }
);

const defaultReceiptData: ReceiptData = {
  vendorName: '',
  customerName: '',
  date: '',
  total: '',
  taxAmount: '',
  subtotal: '',
  invoiceId: '',
  vatNumber: '',
  crNumber: '',
  lineItems: []
};

// Add a new styled component for the form container
const FormContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(3),
  maxWidth: '100%',
  margin: '0 auto',
  position: 'relative',
}));

// Add a loading overlay component
const LoadingOverlay = styled(Box)(({ theme }) => ({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(255, 255, 255, 0.8)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: theme.zIndex.modal,
}));

// Import the account data
const expenseAccountData = `Cost Of Goods Sold
     • Cost of Goods Sold
     • [ 50100 ] Direct Labor
         • [ 50101 ] Field Staff Salaries & Wages
     • [ 50500 ] Equipment Hire
     • [ 50400 ] Material Cost
     • [ 50700 ] Project / Jobs Cost
         • [ 50701 ] Kemya Project
         • [ 50703 ] Ma'aden
         • [ 50702 ] Sinopec / Aramco IPC - Qatif
     • [ 50600 ] Project Consumables
     • [ 50300 ] Services / Subcontractors
     • [ 50200 ] Workers End of Service
Expense
     • Advertising And Marketing
     • Automobile Expense
     • Bad Debt
     • Bank Fees and Charges
     • [ 51504 ] Building Insurance
     • Consultant Expense
     • Credit Card Charges
     • Depreciation Expense
         • [ 52306 ] Depreciation Buildings
         • [ 52305 ] Depreciation Camp Equipment
         • [ 52307 ] Depreciation Company Owned Vehicles
         • [ 52301 ] Depreciation Furniture & Fixture
         • [ 52304 ] Depreciation Lease Equipment
         • [ 52308 ] Depreciation Lease Vehicles
         • [ 52303 ] Depreciation Machine & Equipment
         • [ 52302 ] Depreciation Office Equipments
     • IT and Internet Expenses
     • Janitorial Expense
     • Lodging
     • Meals and Entertainment
     • [ 52000 ] Misc. Expenses
         • [ 52100 ] Misc. Expense
             • [ 52104 ] Auditors Fee
             • [ 52105 ] Commission on Projects
             • [ 52103 ] Lawer Fee
             • [ 52108 ] Postage Expenses
             • [ 52111 ] Safety Expenses
             • [ 52109 ] Sites Visit Expenses
             • [ 52112 ] Special Training Course
             • [ 52110 ] Translations
             • [ 52102 ] Visa Processing Expenses
     • Office Supplies
     • [ 51000 ] Operating Expenses
         • [ 51400 ] Admin Salaries & Wages
             • [ 51401 ] Admin Salaries
             • [ 51404 ] Admin Staff End of Service
             • [ 51403 ] Leave Enchashment
             • [ 51406 ] Medical Expenses
             • [ 51407 ] Other Allowances and Bonuses
             • [ 51402 ] Saudi Staff Salaries
             • [ 51408 ] SILA Telework Management Fee
             • [ 51405 ] Travelling Allowance
         • [ 51800 ] Al-Hamra House Expenses
             • [ 51802 ] Al-Hamra House Electricity Bill
             • [ 51805 ] Al-Hamra House Internet Bill
             • [ 51804 ] Al-Hamra House Maintenance
             • [ 51801 ] Al-Hamra House Monthly Rent
             • [ 51803 ] Al-Hamra House Water Bill
         • [ 51300 ] Camp Utilities
             • [ 51303 ] Diesel for Generators
             • [ 51302 ] Petrol for Pumps
             • [ 51301 ] Water Supply
         • [ 51500 ] Insurance Expenses
             • [ 51501 ] GOSI
             • [ 51503 ] Vehicle Insurance
             • [ 51502 ] Workers Health Insurance
         • [ 51900 ] Interest Expenses
             • [ 51902 ] Deferred Interest Expense Bank Finance
             • [ 51901 ] Deferred Interest Expense Lease
             • [ 51903 ] Other Interest
         • [ 51600 ] Legal and Professional Expenses
             • [ 51606 ] Baldia License Fee
             • [ 51612 ] Civil Defense
             • [ 51601 ] Document Chamber Fee
             • [ 51602 ] Iqama Renewals
             • [ 51607 ] MCC Muqeem Fee (Manpower)
             • [ 51608 ] MCC Muqeem Fee (Vehicles)
             • [ 51605 ] Profession Change Fee
             • [ 51603 ] Re-Entry Visa Fee
             • [ 51611 ] Vehicle Istamara Renewal
             • [ 51609 ] Vehicles Computer Passing
             • [ 51604 ] Visa Transfer Fee
             • [ 51610 ] Zakat
         • [ 51100 ] Office Expenses
             • [ 51104 ] Meals and Entertainment Expenses
             • [ 51102 ] Office Cleanliness / Janitorial
             • [ 51103 ] Office Mess Expenses
             • [ 51101 ] Office Stationary
         • [ 51700 ] Rent Expenses
             • [ 51704 ] Additional Room Hire
             • [ 51702 ] Baldia Land Lease Payment Tashliya
             • [ 51701 ] Baldia Land Lease Payment Workshop
             • [ 51705 ] Garbage Skip Rent
             • [ 51703 ] Staff Camp Rent
         • [ 51200 ] Utility Bill Expenses
             • [ 51206 ] MCC Domain Fee
             • [ 51207 ] MCC Electricity Bills
             • [ 51205 ] MCC ZAIN Internet Connection
             • [ 51204 ] Mr. Jamil Mobile Bills
             • [ 51202 ] STC Fax Line 013 3618507
             • [ 51203 ] STC Flex 50
             • [ 51201 ] STC Land Line 013 3618850
     • Other Expenses
         • [ 52203 ] Charity
         • [ 52204 ] Material Lost
         • [ 52202 ] Panalities and Fines
         • [ 52206 ] R&D Expenses
         • [ 52205 ] TUV Machines and Equipments
     • Postage
     • Printing and Stationery
     • Purchase Discounts
     • Rent Expense
     • Repairs and Maintenance
         • [ 53200 ] Vehicle Maintenance Expenses
             • [ 53219 ] Maintenance CCTV Cameras
             • [ 53216 ] Maintenance General
             • [ 53212 ] Maintenance HINO Boom Truck 1370
             • [ 53213 ] Maintenance HINO Dump Truck 1475
             • [ 53204 ] Maintenance Land Cruiser 2911 HJT
             • [ 53210 ] Maintenance MICRO BUS 7874 BGA
             • [ 53223 ] Maintenance Of BOOM TRUCK 9454
             • [ 53215 ] Maintenance Of Genset JCB 88
             • [ 53224 ] Maintenance Of JUMPING COMPACT
             • [ 53214 ] Maintenance Office Premises
             • [ 53209 ] Maintenance Pickup 5361 TATA
             • [ 53206 ] Maintenance Pickup 7860 BGA
             • [ 53205 ] Maintenance Pickup 7899 BGA
             • [ 53207 ] Maintenance Pickup 7943 BGA
             • [ 53208 ] Maintenance Pickup 9215
             • [ 53218 ] Maintenance Shearing Machine
             • [ 53211 ] Maintenance TATA BUS 7556 BGA
             • [ 53220 ] Maintenance Toyota Forklifter
             • [ 53201 ] Maintenance Yaris Car 1167 SXB
             • [ 53203 ] Maintenance Yaris Car 8476 HJJ
             • [ 53202 ] Maintenance Yaris Car 8480 HJJ
             • [ 53238 ] Rep & Maint Fire Water Pump
             • [ 53236 ] Rep & Maint Hyster Folk Lifter
             • [ 53235 ] Rep & Maint Plate Compactor
             • [ 53237 ] Rep & Maint Sand Blasting Machine
             • [ 53234 ] Rep & Maint Small Diesel Generator
             • [ 53240 ] Rep & Mant. Air Compressor
             • [ 53239 ] Rep & Mant. Power Gen. Petrol
             • [ 53231 ] Rep & Mant. Vertical Drilling
             • [ 53232 ] Rep & Manti Camp Equipments
             • [ 53233 ] Rep & Manti Genset JCB 120 KVA
             • [ 53225 ] Repairing Asphalt Cuter Diesel
             • [ 53226 ] Repairing Asphalt Cutter Petro
             • [ 53229 ] Repairing Folk Lifter Caterpillar
             • [ 53222 ] Repairing Miller Blue 400 DX
             • [ 53217 ] Repairing of Office Computers
             • [ 53227 ] Repairing Office AC
             • [ 53230 ] Repairing Over Head Crane 10 T
             • [ 53228 ] Repairing Small Milling Machine
             • [ 53221 ] Tower Light ME0063 AKRAM ALI
             • [ 53241 ] Tower Light ME0064 Yar Khan
             • [ 53242 ] Tower Light ME0066 George
             • [ 53243 ] Tower Light ME0067 Zafar
             • [ 53244 ] Tower Light ME0071 Ashraf
         • [ 53100 ] Vehicle Running Fuel Expenses
             • [ 53113 ] Fuel HINO Boom Truck 1370
             • [ 53114 ] Fuel HINO Dump Truck 1475
             • [ 53104 ] Fuel Land Cruiser 2911 HJT
             • [ 53111 ] Fuel MICRO BUS 7874 BGA
             • [ 53117 ] Fuel Misc. Workshop
             • [ 53105 ] Fuel Mr. Mattar Al-Khaldi
             • [ 53110 ] Fuel Pickup 5361 TATA
             • [ 53107 ] Fuel Pickup 7860 BGA
             • [ 53106 ] Fuel Pickup 7899 BGA
             • [ 53108 ] Fuel Pickup 7943 BGA
             • [ 53109 ] Fuel Pickup 9215
             • [ 53116 ] Fuel Tashliya Equipment
             • [ 53112 ] Fuel TATA BUS 7556 BGA
             • [ 53118 ] Fuel Turki Al Oqeli
             • [ 53115 ] Fuel Workshop Folk Lifter Toyo
             • [ 53101 ] Fuel Yaris Car 1167 SXB
             • [ 53103 ] Fuel Yaris Car 8476 HJJ
             • [ 53102 ] Fuel Yaris Car 8480 HJJ`;

const paidThroughData = `Bank
[ 10200 ] Bank Accounts
[ 10202 ] MCC Al-Rajhi Account
[ 10201 ] MCC Saudi National Bank
[ 10221 ] STC PAY Merchant
Cash
[ 10100 ] Cash Accounts
     • [ 10101 ] Cash in Hand
     • [ 10212 ] PC Abdul Waheed
     • [ 10205 ] PC Abdullah Bakar
     • [ 10203 ] PC Akram Ali
     • [ 10213 ] PC Amin Mughal
     • [ 10215 ] PC Amjad Saeed
     • [ 10217 ] PC Getachew Wakuma
     • [ 10219 ] PC Haseeb Jameel
     • [ 10214 ] PC Irshad Masih
     • [ 10218 ] PC Mattar Al Khaldi
     • [ 10210 ] PC Mr. Abdul Wahab
     • [ 10208 ] PC Mr. Amrit Bahadur
     • [ 10206 ] PC Mr. Jamil Ahmad
     • [ 10211 ] PC Mr. Shahbaz Ali
     • [ 10207 ] PC Mr. Zafar Abbas
     • [ 10204 ] PC Mumtaz Hussain Akbar
     • [ 10220 ] PC Shakeel Anwar
     • [ 10216 ] PC Zaheer Abbas
     • [ 10209 ] PC. Mr. George Varghese
Petty Cash
"Undeposited Funds"
"Other Current Asset"
"Advance Tax"
[ 13500 ] Advance to Supplier
[ 13400 ] Deffered Interest
     • [ 13404 ] Allowance for Doubtful Debts
     • [ 13401 ] Deffered Inter Lease Vehicles
     • [ 13403 ] Other Deposit
     • [ 13402 ] Security Deposit for Room Rent
"Employee Advance"
     • [ 11216 ] Adance to Abdul Waheed
     • [ 11218 ] Adance to GulZamin Khan Safety
     • [ 11217 ] Adance to Malik Asif WPR
     • [ 11223 ] Advance to Abdul Moeen BBS
     • [ 11209 ] Advance to Abdul Wahab
     • [ 11201 ] Advance to Akram Ali Ashraf
     • [ 11220 ] Advance to Akram Khalid
     • [ 11206 ] Advance to Amin Mughal
     • [ 11219 ] Advance to Amjad Saeed
     • [ 11227 ] Advance to Ashraf Khan Driver
     • [ 11222 ] Advance to Fatih Turkey CM
     • [ 11202 ] Advance to George Varghese
     • [ 11207 ] Advance to Geta Chew Wakuma
     • [ 11208 ] Advance to Ikram Driver
     • [ 11228 ] Advance to Irshad Masih
     • [ 11214 ] Advance to M. Asif
     • [ 11203 ] Advance to MD. Arif
     • [ 11204 ] Advance to Mr. Mattar Al-Khaldi
     • [ 11211 ] Advance to Muhammad Ahmar Ali
     • [ 11210 ] Advance to Muhammad Salman
     • [ 11225 ] Advance to Munzir Bakhit
     • [ 11215 ] Advance to Nahar Khan
     • [ 11212 ] Advance to Shahbaz Ali
     • [ 11229 ] Advance to Shahid Nadeem
     • [ 11213 ] Advance to Shakeel Anwar
     • [ 11205 ] Advance to Turkey Bin Bilal
     • [ 11226 ] Advance to Zafar Abbas
     • [ 11224 ] Advance to Zaheer Abbas Secert
     • [ 11230 ] Advance to Zaheer Islam
     • [ 11221 ] Advance to Zehal Ul Islam (Safety Officer)
[ 13300 ] Mowarad Basharia Invoices
     • [ 13301 ] Mowarad Basharia Inv. Fahad
"Prepaid Expenses"
[ 13000 ] Prepayments
     • [ 13200 ] Factory Abdulla BakerAffiliate
     • [ 13100 ] Prepaid Insurance
"Sales to Customers (Cash)"
"VAT Carry Forward"
"Fixed Asset"
[ 14000 ] Fixed Assets
     • [ 14900 ] Accumulated Depreciation
         • [ 14908 ] Accum. Deprc Lease Equipments
         • [ 14907 ] Accum. Deprc Lease Vehicles
         • [ 14905 ] Accum. Depreciation-Buildings
         • [ 14904 ] Accum. Depreciation-Camp Equip
         • [ 14901 ] Accum. Depreciation-Furniture
         • [ 14903 ] Accum. Depreciation-Machines
         • [ 14902 ] Accum. Depreciation-Office Equipment
         • [ 14906 ] Accum. Depreciation-Vehicles
     • [ 14801 ] Al Hamra House Building
     • [ 14802 ] Al Hamra House Land
     • [ 14600 ] Camp Equipments
     • [ 14100 ] Furniture & Fixture
     • [ 14200 ] Machines & Equipments
     • [ 14500 ] Machines & Equipments Lease Hold
     • [ 14800 ] MCC Building
     • [ 14700 ] MCC Tashliya Yard / Camp
     • [ 14400 ] Office Equipments
     • [ 14300 ] Vehicles
         • [ 14317 ] Veh. Boom Truck Hino 1370
         • [ 14311 ] Veh. DC Sailor 6202
         • [ 14310 ] Veh. DC TATA 5361
         • [ 14302 ] Veh. DC Toyota 7860
         • [ 14301 ] Veh. DC Toyota 7899
         • [ 14303 ] Veh. DC Toyota 9215
         • [ 14314 ] Veh. Dump Truck 6201
         • [ 14318 ] Veh. Dupm Truck Hino 1475
         • [ 14316 ] Veh. Pajero Jeep 3379
         • [ 14305 ] Veh. SC Toyota 7943
         • [ 14304 ] Veh. Toyota Hiace 7874
         • [ 14306 ] Veh. Toyota Yaris 1167
         • [ 14308 ] Veh. Toyota Yaris 8476
         • [ 14307 ] Veh. Toyota Yaris 8480
         • [ 14315 ] Veh. Water Tanker 8238
         • [ 14313 ] Veh.Boom Truck 9454
         • [ 14312 ] Veh.TATA BUS 7556
         • [ 14309 ] Veh.Toyota Land CruiserV8 2911
"Furniture and Equipment"
"Other Current Liability"
[ 21000 ] Accrued Expenses
     • [ 21400 ] Current Portion Long-Term Debt
         • [ 21401 ] Provision of End of Services
     • [ 21300 ] Insurance Payable
     • [ 21600 ] Other Current Liabilities
         • [ 21603 ] Auditor's Fees Payable
         • [ 21601 ] Commission on Projects Payable
         • [ 21602 ] Loan from Mr. Jamil Ahmad
         • [ 21604 ] SAGIA License Fees Payable
     • [ 21500 ] Provision for Zakat
     • [ 21200 ] Salaries & Wages Payable
         • [ 21202 ] Admin Salaries Payable
         • [ 21203 ] Field Staff Salaries Payable
         • [ 21201 ] Saudi Staff Salaries Payable
     • [ 21100 ] Utility Bills
         • [ 21123 ] Al Hamra House Mobily Internet
         • [ 21120 ] AL-HAMRAH HOUSE RENT PAYABLE
         • [ 21119 ] AL-HAMRAH HOUSE WATER BILL.
         • [ 21117 ] ALHAMRA HOUSE ELECTRICITY BILL
         • [ 21116 ] MCC ELECTRICITY BILL
         • [ 21118 ] MCC GOSI PAYABLE
         • [ 21124 ] MCC ZAIN Internet for Container
         • [ 21104 ] MOBILY MR. JAMEEL 0540075422
         • [ 21121 ] MR. JAMIL ZAIN SIM BILL
         • [ 21122 ] Staff Camp Jubail Rent Payable
         • [ 21102 ] STC Fax Line Bill
         • [ 21111 ] STC FLEX 50 Abdul Wahab 055606
         • [ 21109 ] STC FLEX 50 Akram Ali 05524792
         • [ 21108 ] STC FLEX 50 Amrit 0551560367
         • [ 21112 ] STC FLEX 50 George 0552593181
         • [ 21114 ] STC FLEX 50 Ikram 0556124320
         • [ 21113 ] STC FLEX 50 Irshad 0552626907
         • [ 21105 ] STC FLEX 50 MR. JAMEEL 0554216168
         • [ 21106 ] STC FLEX 50 MR. MATTAR 0505255
         • [ 21107 ] STC FLEX 50 MR. Zafar 0505664512
         • [ 21110 ] STC FLEX 50 Murad 0530057791
         • [ 21101 ] STC Land Line Bill
         • [ 21103 ] STC Mr. Jameel 0504901432
         • [ 21115 ] ZAIN OFFICE INTERNET WIFI
[ 21605 ] Advance from Customers
"Employee Reimbursements"
"Excise Tax Payable"
"GCC VAT Payable"
"Long Term Liability"
[ 24000 ] Bank Financing
     • [ 24100 ] Banks Financing
         • [ 24101 ] Bank Financing (1) Boom Truck
         • [ 24102 ] Bank Financing (2) Dump Truck
[ 23000 ] Lease Payments
     • [ 23300 ] Lease Payments Equipment
         • [ 23301 ] Lease Payment Equip Folklifter
     • [ 23100 ] Lease Payments Land
     • [ 23200 ] Lease Payments Vehicle
         • [ 23202 ] Lease Payments LC V8 2911
         • [ 23201 ] Lease Payments Pickup 9215
"Equity"
"Drawings"
"Opening Balance Offset"
"Owner's Equity"
     • [ 30100 ] Paidup Capital
         • [ 30101 ] Capital Share Abdullah Bakar
         • [ 30103 ] Capital Share Jameel Ahmad
         • [ 30102 ] Capital Share Rayed Bakar
     • [ 30200 ] Partners' Current Account
         • [ 30201 ] Current Account Abdullah Bakar
         • [ 30203 ] Current Account Jameel Ahmad
         • [ 30202 ] Current Account Rayed Bakar
     • [ 30300 ] Statutory Reserve`;

const ExpenseForm: React.FC = () => {
  // Initialize services only once using useMemo
  const services = useMemo(() => ({
    bedrock: new BedrockService(),
    s3: new S3Service(),
    receipt: new ReceiptService()
  }), []);

  const router = useRouter();
  
  // Group related state together
  const [fileState, setFileState] = useState({
    receipt: null as File | null,
    s3Key: null as string | null
  });

  const [receiptState, setReceiptState] = useState({
    data: defaultReceiptData,
    savedReceipt: null as SavedReceipt | null
  });

  const [uiState, setUiState] = useState({
    isLoading: false,
    isSaving: false,
    error: null as { message: string; details?: string } | null,
    successMessage: null as string | null
  });

  const [date, setDate] = useState<Date | null>(new Date());
  const [vendorName, setVendorName] = useState('');
  const [vatNumber, setVatNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [vatPercentage, setVatPercentage] = useState('15'); // Default Saudi VAT rate
  const [referenceNumber, setReferenceNumber] = useState('');
  const [description, setDescription] = useState('');
  const [expenseAccountId, setExpenseAccountId] = useState('');
  const [paidThroughAccountId, setPaidThroughAccountId] = useState('');

  const expenseAccounts = parseAccountData(expenseAccountData);
  const paidThroughAccounts = parseAccountData(paidThroughData);

  const [optimizationConfig] = useState({
    image: {
      maxWidth: 1600,
      maxHeight: 1600,
      quality: 0.8,
      convertToGrayscale: false,
      preferWebP: false
    },
    extraction: {
      extractLineItems: true,
      extractCustomerInfo: true,
      extractTaxInfo: true,
      basicFieldsOnly: false
    }
  });

  // Memoize handlers
  const processReceipt = useCallback(async (file: File) => {
    setUiState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const extractedData = await services.bedrock.analyzeReceipt(
        file,
        optimizationConfig.image,
        optimizationConfig.extraction
      );
      setReceiptState(prev => ({ ...prev, data: extractedData }));
      
      // Populate form fields with extracted data
      if (extractedData.date) {
        setDate(new Date(extractedData.date));
      }
      if (extractedData.vendorName) {
        setVendorName(extractedData.vendorName);
      }
      if (extractedData.vatNumber) {
        setVatNumber(extractedData.vatNumber);
      }
      if (extractedData.total) {
        setAmount(extractedData.total.toString());
      }
    } catch (error) {
      console.error('Error processing receipt:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to process receipt';
      setUiState(prev => ({
        ...prev,
        error: {
          message: errorMessage,
          details: error instanceof Error && errorMessage.includes('Service is busy')
            ? 'The service is experiencing high demand. Your request will be retried automatically.'
            : undefined
        }
      }));
      setReceiptState(prev => ({ ...prev, data: defaultReceiptData }));
    } finally {
      setUiState(prev => ({ ...prev, isLoading: false }));
    }
  }, [services.bedrock, optimizationConfig]);

  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setFileState(prev => ({ ...prev, receipt: file }));
      await processReceipt(file);
    }
  }, [processReceipt]);

  const handleCancel = useCallback(() => {
    // Reset all states
    setFileState({ receipt: null, s3Key: null });
    setReceiptState({ data: defaultReceiptData, savedReceipt: null });
    setUiState(prev => ({ ...prev, error: null, successMessage: null }));
    
    // If we have an S3 key, delete the file from S3
    if (fileState.s3Key) {
      services.s3.deleteFile(fileState.s3Key)
        .catch((error) => {
          console.error('Error deleting file from S3:', error);
        });
    }

    // Navigate back to expenses page
    router.push('/expenses');
  }, [fileState.s3Key, router, services.s3]);

  const handleSave = useCallback(async () => {
    if (!fileState.receipt) return;

    setUiState(prev => ({ ...prev, isSaving: true, error: null }));

    try {
      // Upload to S3
      const key = await services.s3.uploadFile(fileState.receipt);
      setFileState(prev => ({ ...prev, s3Key: key }));
      
      // Get the S3 URL
      const s3Url = services.s3.getFileUrl(key);
      
      // Save receipt data to database
      await services.receipt.saveReceipt(receiptState.data, key, s3Url);
      
      setUiState(prev => ({ ...prev, successMessage: 'Receipt saved successfully!' }));
      router.push('/expenses');
    } catch (err) {
      console.error('Error saving receipt:', err);
      setUiState(prev => ({
        ...prev,
        error: {
          message: 'An error occurred while saving the receipt. Please try again.',
        }
      }));
      
      // Clean up S3 file if needed
      if (fileState.s3Key) {
        try {
          await services.s3.deleteFile(fileState.s3Key);
          setFileState(prev => ({ ...prev, s3Key: null }));
        } catch (cleanupError) {
          console.error('Failed to clean up S3 file:', cleanupError);
        }
      }
    } finally {
      setUiState(prev => ({ ...prev, isSaving: false }));
    }
  }, [fileState.receipt, fileState.s3Key, receiptState.data, router, services]);

  // Memoize update handlers
  const handleReceiptDetailsUpdate = useCallback((field: keyof ReceiptData, value: string) => {
    setReceiptState(prev => ({
      ...prev,
      data: { ...prev.data, [field]: value }
    }));
  }, []);

  const handleAddLineItem = useCallback(() => {
    setReceiptState(prev => ({
      ...prev,
      data: {
        ...prev.data,
        lineItems: [
          ...prev.data.lineItems,
          {
            id: `item-${Date.now()}`,
            description: '',
            quantity: 1,
            unitPrice: 0,
            amount: 0,
            discount: 0
          }
        ]
      }
    }));
  }, []);

  const handleRemoveLineItem = useCallback((index: number) => {
    setReceiptState(prev => ({
      ...prev,
      data: {
        ...prev.data,
        lineItems: prev.data.lineItems.filter((_, i) => i !== index)
      }
    }));
  }, []);

  const handleUpdateLineItem = useCallback((
    index: number,
    field: keyof ReceiptData['lineItems'][0],
    value: string | number
  ) => {
    setReceiptState(prev => {
      const newLineItems = [...prev.data.lineItems];
      const item = { ...newLineItems[index], [field]: value };
      
      if (field === 'quantity' || field === 'unitPrice') {
        const quantity = field === 'quantity' ? Number(value) : item.quantity;
        const unitPrice = field === 'unitPrice' ? Number(value) : item.unitPrice;
        item.amount = quantity * unitPrice;
      }
      
      newLineItems[index] = item;
      return {
        ...prev,
        data: {
          ...prev.data,
          lineItems: newLineItems
        }
      };
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !vendorName || !expenseAccountId || !paidThroughAccountId || !amount || !fileState.receipt) {
      setUiState(prev => ({ ...prev, error: { message: 'Please fill in all required fields' } }));
      return;
    }

    setUiState(prev => ({ ...prev, isSaving: true, isLoading: false, error: null }));

    try {
      // Extract account codes
      const expenseAccount = expenseAccounts.flatMap(acc => [acc, ...(acc.children || [])]).find(acc => acc.id === expenseAccountId);
      const paidThroughAccount = paidThroughAccounts.flatMap(acc => [acc, ...(acc.children || [])]).find(acc => acc.id === paidThroughAccountId);

      if (!expenseAccount?.code) {
        throw new Error('Invalid expense account selected');
      }

      if (!paidThroughAccount?.code) {
        throw new Error('Invalid paid through account selected');
      }

      const formData = new FormData();
      formData.append('date', format(date, 'yyyy-MM-dd'));
      formData.append('vendorName', vendorName);
      formData.append('vatNumber', vatNumber || '');
      formData.append('expenseAccountId', expenseAccount.code);
      formData.append('paidThroughAccountId', paidThroughAccount.code);
      formData.append('amount', amount);
      formData.append('vatPercentage', vatPercentage);
      formData.append('referenceNumber', referenceNumber);
      formData.append('description', description);
      formData.append('receipt', fileState.receipt);

      console.log('Submitting expense with data:', {
        date: format(date, 'yyyy-MM-dd'),
        vendorName,
        vatNumber,
        expenseAccountId: expenseAccount.code,
        paidThroughAccountId: paidThroughAccount.code,
        amount
      });

      const response = await fetch('/api/zoho-books/expenses', {
        method: 'POST',
        body: formData,
      });

      const responseData = await response.json();

      if (!response.ok) {
        console.error('Error response from server:', responseData);
        throw new Error(responseData.error || 'Failed to create expense');
      }

      setUiState(prev => ({ ...prev, successMessage: 'Expense saved successfully!' }));
      router.push('/expenses');
    } catch (err) {
      console.error('Error saving expense:', err);
      setUiState(prev => ({
        ...prev,
        error: {
          message: err instanceof Error ? err.message : 'An error occurred while saving the expense',
          details: 'Please check the account selections and try again.'
        }
      }));
    } finally {
      setUiState(prev => ({ ...prev, isSaving: false }));
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <FormContainer>
        {/* Loading Overlay */}
        {(uiState.isLoading || uiState.isSaving) && (
          <LoadingOverlay>
            <CircularProgress size={48} sx={{ mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              {uiState.isSaving ? 'Saving Expense...' : 'Processing Receipt...'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {uiState.isSaving 
                ? 'Saving your expense details. Please wait...'
                : 'Our AI is analyzing your receipt. This may take a few moments.'}
            </Typography>
          </LoadingOverlay>
        )}

        {/* Error/Success Messages */}
        <Snackbar
          open={!!uiState.error || !!uiState.successMessage}
          autoHideDuration={6000}
          onClose={() => setUiState(prev => ({ ...prev, error: null, successMessage: null }))}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert
            severity={uiState.error ? "error" : "success"}
            variant="filled"
            onClose={() => setUiState(prev => ({ ...prev, error: null, successMessage: null }))}
          >
            {uiState.error ? (
              <>
                <Typography variant="subtitle2">{uiState.error.message}</Typography>
                {uiState.error.details && (
                  <Typography variant="body2" sx={{ mt: 0.5, opacity: 0.9 }}>
                    {uiState.error.details}
                  </Typography>
                )}
              </>
            ) : (
              uiState.successMessage
            )}
          </Alert>
        </Snackbar>

        {/* Upload Receipt Card */}
        <Card>
          <Box sx={{ p: 3 }}>
            <FileUploadSection
              onFileChange={handleFileChange}
              receipt={fileState.receipt}
              isLoading={uiState.isLoading}
              onCancel={handleCancel}
              onProcessAgain={() => fileState.receipt && processReceipt(fileState.receipt)}
              receiptData={receiptState.data}
              onSaveSuccess={(savedReceipt) => setReceiptState(prev => ({ ...prev, savedReceipt }))}
            />
          </Box>
        </Card>

        {/* Receipt Details Card */}
        <Card>
          <Box component="form" onSubmit={handleSubmit} sx={{ p: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Receipt Details
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <DatePicker
                  label="Date"
                  value={date}
                  onChange={(newValue) => setDate(newValue)}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Vendor Name"
                  value={vendorName}
                  onChange={(e) => setVendorName(e.target.value)}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="VAT Number"
                  value={vatNumber}
                  onChange={(e) => setVatNumber(e.target.value)}
                  placeholder="Enter VAT number"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="VAT Percentage"
                  type="number"
                  value={vatPercentage}
                  onChange={(e) => setVatPercentage(e.target.value)}
                  placeholder="Enter VAT percentage"
                  InputProps={{
                    endAdornment: <InputAdornment position="end">%</InputAdornment>,
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Reference Number"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  placeholder="Enter reference number"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter expense description"
                />
              </Grid>

              <Grid item xs={12}>
                <FormControl 
                  fullWidth 
                  required
                  sx={{ '& .MuiInputLabel-root': { background: 'white', px: 1 } }}
                >
                  <InputLabel shrink id="expense-account-label">Expense Account</InputLabel>
                  <HierarchicalSelect
                    labelId="expense-account-label"
                    options={expenseAccounts}
                    value={expenseAccountId}
                    onChange={setExpenseAccountId}
                    label="Expense Account"
                  />
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <FormControl 
                  fullWidth 
                  required
                  sx={{ '& .MuiInputLabel-root': { background: 'white', px: 1 } }}
                >
                  <InputLabel shrink id="paid-through-label">Paid Through</InputLabel>
                  <HierarchicalSelect
                    labelId="paid-through-label"
                    options={paidThroughAccounts}
                    value={paidThroughAccountId}
                    onChange={setPaidThroughAccountId}
                    label="Paid Through"
                  />
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  InputProps={{
                    inputProps: { min: 0, step: 0.01 },
                  }}
                />
              </Grid>
            </Grid>
          </Box>
        </Card>

        {/* Line Items Card */}
        <Card>
          <Box sx={{ p: 3 }}>
            <ExpenseLineItems
              lineItems={receiptState.data.lineItems}
              onUpdateLineItem={handleUpdateLineItem}
              onAddLineItem={handleAddLineItem}
              onRemoveLineItem={handleRemoveLineItem}
              isLoading={uiState.isLoading}
            />
          </Box>
        </Card>

        {/* Action Buttons */}
        <Box sx={{ 
          mt: 2, 
          display: 'flex', 
          justifyContent: 'space-between',
          gap: 2,
        }}>
          <Button
            variant="outlined"
            color="error"
            onClick={handleCancel}
            disabled={uiState.isLoading || uiState.isSaving}
            startIcon={<CancelIcon />}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={uiState.isLoading || uiState.isSaving || !date || !vendorName || !expenseAccountId || !paidThroughAccountId || !amount || !fileState.receipt}
            startIcon={<SaveIcon />}
            onClick={handleSubmit}
          >
            {uiState.isSaving ? 'Saving...' : 'Save Expense'}
          </Button>
        </Box>
      </FormContainer>
    </LocalizationProvider>
  );
};

export default memo(ExpenseForm);

import { useGetDistrictsListQuery, useGetRegionsListQuery } from "@store/slices/productsApiSlice";
import { BadgeDollarSign, Briefcase, Building2, Camera, ChevronLeft, ChevronRight, DollarSign, Home, Hotel, KeyRound, Landmark, LandPlot, Loader2, Map, MapPin, Settings, Upload, Warehouse, X } from "lucide-react";
import { useEffect, useState } from "react";

interface Region {
  region: string;
}

interface District {
  district: string;
}

interface RegionsResponse {
  success: boolean;
  regions: Region[];
}

interface DistrictsResponse {
  success: boolean;
  districts: District[];
}

const NewPropertyComp = () => {
  // API queries
  const { data: regionsData, isLoading: loadingRegions, error: regionsError } = useGetRegionsListQuery({});

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;
  const [region, setRegion] = useState('');

  // Get districts query - only call when region is selected
  const {
    data: districtsData,
    isLoading: loadingDistricts
  } = useGetDistrictsListQuery(region, {
    skip: !region // Skip the query if no region is selected
  });

  // Basic Information
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [propertyType, setPropertyType] = useState<string>('');
  const [listingType, setListingType] = useState<string>('');

  // Location Information
  const [address, setAddress] = useState<string>('');
  const [district, setDistrict] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [latitude, setLatitude] = useState<string>('');
  const [longitude, setLongitude] = useState<string>('');
  const [loadingCoordinates, setLoadingCoordinates] = useState<boolean>(false);

  // Property Details
  const [bedrooms, setBedrooms] = useState<string>('');
  const [bathrooms, setBathrooms] = useState<string>('');
  const [squareMeters, setSquareMeters] = useState<string>('');
  const [floor, setFloor] = useState<string>('');
  const [totalFloors, setTotalFloors] = useState<string>('');
  const [yearBuilt, setYearBuilt] = useState<string>('');
  const [parkingSpaces, setParkingSpaces] = useState<string>('0');

  // Pricing
  const [price, setPrice] = useState<string>('');
  const [currency, setCurrency] = useState<string>('UZS');

  // Features
  const [features, setFeatures] = useState<{
    hasBalcony: boolean;
    hasGarage: boolean;
    hasGarden: boolean;
    hasPool: boolean;
    hasElevator: boolean;
    isFurnished: boolean;
  }>({
    hasBalcony: false,
    hasGarage: false,
    hasGarden: false,
    hasPool: false,
    hasElevator: false,
    isFurnished: false
  });

  // Images
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);

const propertyTypes: {
  value: string;
  label: string;
  icon: React.ReactNode;
}[] = [
  { value: 'apartment', label: 'Apartment', icon: <Building2 size={20} /> },
  { value: 'house', label: 'House', icon: <Home size={20} /> },
  { value: 'townhouse', label: 'Townhouse', icon: <Landmark size={20} /> },
  { value: 'villa', label: 'Villa', icon: <Hotel size={20} /> },
  { value: 'commercial', label: 'Commercial', icon: <Building2 size={20} /> },
  { value: 'office', label: 'Office', icon: <Briefcase size={20} /> },
  { value: 'land', label: 'Land', icon: <LandPlot size={20} /> },
  { value: 'warehouse', label: 'Warehouse', icon: <Warehouse size={20} /> }
];
const listingTypes: {
  value: string;
  label: string;
  icon: React.ReactNode;
}[] = [
  { value: 'sale', label: 'For Sale', icon: <BadgeDollarSign size={20} color="#16a34a"/> },
  { value: 'rent', label: 'For Rent', icon: <KeyRound size={20} color="#3b82f6" /> }
];

  // Extract regions list from API response
  const regionsList: Region[] = regionsData && (regionsData as RegionsResponse).success ? (regionsData as RegionsResponse).regions : [];

  // Extract districts list from API response
  const districtsList: District[] = districtsData && (districtsData as DistrictsResponse).success ? (districtsData as DistrictsResponse).districts : [];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentStep]);

  // Reset district when region changes
  useEffect(() => {
    if (region) {
      setDistrict(''); // Reset district selection when region changes
    }
  }, [region]);

  // Get coordinates using geocoding
  const getCoordinates = async (fullAddress: string) => {
    if (!fullAddress.trim()) return;

    setLoadingCoordinates(true);
    try {
      // Option 1: Use browser geolocation if user allows
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setLatitude(position.coords.latitude.toString());
            setLongitude(position.coords.longitude.toString());
            setLoadingCoordinates(false);
          },
          async (error) => {
            console.log('Geolocation error:', error);
            // Fallback to geocoding service
            await geocodeAddress(fullAddress);
          }
        );
      } else {
        // Fallback to geocoding service
        await geocodeAddress(fullAddress);
      }
    } catch (error) {
      console.error('Error getting coordinates:', error);
      setLoadingCoordinates(false);
    }
  };

  const geocodeAddress = async (address: string) => {
    try {
      // Using OpenStreetMap Nominatim (free service)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        setLatitude(data[0].lat);
        setLongitude(data[0].lon);
      } else {
        // If no results, you might want to show an error or ask user to manually set location
        console.log('No coordinates found for address');
        alert('Could not find coordinates for this address. Please enter them manually.');
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      alert('Error getting coordinates. Please enter them manually.');
    } finally {
      setLoadingCoordinates(false);
    }
  };

const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setAddress(e.target.value);
};

  const handleGetCoordinates = () => {
    const selectedRegion = regionsList.find(r => r.region === region);
    const selectedDistrict = districtsList.find(d => d.district === district);

    const fullAddress = `${address}, ${selectedDistrict?.district || ''}, ${selectedRegion?.region || ''}, Uzbekistan`;
    getCoordinates(fullAddress);
  };

 const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const files = e.target.files;
  if (!files) return;

  const totalImages = imagePreviews.length + files.length;
  if (totalImages > 10) {
    alert("Maximum 10 images allowed");
    return;
  }

  const previews: (string | ArrayBuffer | null)[] = [];
  const fileArray: File[] = [];

  Array.from(files).forEach((file) => {
    const reader = new FileReader();
    fileArray.push(file);

    reader.onloadend = () => {
      previews.push(reader.result);
      if (previews.length === files.length) {
        setImagePreviews((prev) => [...prev, ...previews]);
        setImageFiles((prev) => [...prev, ...fileArray]);
      }
    };

    reader.readAsDataURL(file);
  });
};


  const handleRemoveImage = (index:number) => {
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const formatPrice = (value: string): string => {
    const numericValue = value.replace(/[^0-9]/g, "");
    const formattedInt = parseInt(numericValue || "0", 10)
      .toLocaleString("en-US")
      .replace(/,/g, ".");
    return formattedInt;
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const formattedValue = formatPrice(rawValue);
    setPrice(formattedValue);
  };

  const handleFeatureChange = (feature: keyof typeof features) => {
    setFeatures(prev => ({
      ...prev,
      [feature]: !prev[feature]
    }));
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getStepIcon = (step: number) => {
    switch (step) {
      case 1: return <Home className="w-5 h-5" />;
      case 2: return <MapPin className="w-5 h-5" />;
      case 3: return <Settings className="w-5 h-5" />;
      case 4: return <Camera className="w-5 h-5" />;
      default: return null;
    }
  };

  const renderProgressBar = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {[1, 2, 3, 4].map((step) => (
          <div key={step} className="flex flex-col items-center">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
              step <= currentStep
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-gray-200 text-gray-400'
            }`}>
              {getStepIcon(step)}
            </div>
            <span className={`text-sm mt-2 font-medium ${
              step <= currentStep ? 'text-blue-600' : 'text-gray-400'
            }`}>
              Step {step}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-6">
        <div className="bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Basic Information</h2>
        <p className="text-gray-600">Tell us about your property</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Property Type</label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {propertyTypes.map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => setPropertyType(type.value)}
              className={`p-4 rounded-lg border-2 text-center transition-all duration-200 ${
                propertyType === type.value
                  ? 'border-blue-600 bg-blue-50 text-blue-600'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="text-2xl mb-2">{type.icon}</div>
              <div className="text-sm font-medium">{type.label}</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Listing Type</label>
        <div className="grid grid-cols-2 gap-4">
          {listingTypes.map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => setListingType(type.value)}
              className={`p-6 rounded-lg border-2 text-center transition-all duration-200 ${
                listingType === type.value
                  ? 'border-blue-600 bg-blue-50 text-blue-600'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="text-3xl mb-2">{type.icon}</div>
              <div className="text-lg font-semibold">{type.label}</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Property Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter a descriptive title for your property"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Describe your property in detail..."
        />
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Location Details</h2>
        <p className="text-gray-600">Where is your property located?</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Full Address</label>
        <input
          type="text"
          value={address}
          onChange={handleAddressChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter complete address"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Region</label>
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            disabled={loadingRegions}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
          >
            <option value="">Select Region</option>
            {regionsList.map((reg: Region, index: number) => (
              <option key={index} value={reg.region}>
                {reg.region}
              </option>
            ))}
          </select>
          {loadingRegions && (
            <div className="flex items-center mt-2 text-sm text-gray-500">
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Loading regions...
            </div>
          )}
          {regionsError && (
            <div className="mt-2 text-sm text-red-500">
              Error loading regions. Please try again.
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">District</label>
          <select
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            disabled={!region || loadingDistricts}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
          >
            <option value="">Select District</option>
            {districtsList.map((dist: District, index: number) => (
              <option key={index} value={dist.district}>
                {dist.district}
              </option>
            ))}
          </select>
          {loadingDistricts && (
            <div className="flex items-center mt-2 text-sm text-gray-500">
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Loading districts...
            </div>
          )}


        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="City"
        />
      </div>

      {/* Coordinates Section */}
      <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-800">Map Coordinates</h3>
          <button
            type="button"
            onClick={handleGetCoordinates}
            disabled={!address || loadingCoordinates}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {loadingCoordinates ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Map className="w-4 h-4 mr-2" />
            )}
            Get Coordinates
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Latitude</label>
            <input
              type="number"
              step="any"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="41.2995"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Longitude</label>
            <input
              type="number"
              step="any"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="69.2401"
            />
          </div>
        </div>

        {latitude && longitude && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <MapPin className="w-4 h-4 text-green-600 mr-2" />
              <span className="text-green-800 text-sm font-medium">
                Coordinates set: {parseFloat(latitude).toFixed(6)}, {parseFloat(longitude).toFixed(6)}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center">
          <MapPin className="w-5 h-5 text-blue-600 mr-2" />
          <span className="text-blue-800 font-medium">Location Tips</span>
        </div>
        <div className="text-blue-700 text-sm mt-2 space-y-1">
          <p>• Fill in the address first, then click "Get Coordinates" to automatically fetch map location</p>
          <p>• You can also manually enter coordinates if you know the exact location</p>
          <p>• Accurate coordinates help buyers find your property on the map</p>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Property Details</h2>
        <p className="text-gray-600">Provide detailed information about your property</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Bedrooms</label>
          <input
            type="number"
            value={bedrooms}
            onChange={(e) => setBedrooms(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="0"
            min="0"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Bathrooms</label>
          <input
            type="number"
            value={bathrooms}
            onChange={(e) => setBathrooms(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="0"
            min="0"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Floor</label>
          <input
            type="number"
            value={floor}
            onChange={(e) => setFloor(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="1"
            min="0"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Total Floors</label>
          <input
            type="number"
            value={totalFloors}
            onChange={(e) => setTotalFloors(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="1"
            min="1"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Area (m²)</label>
          <input
            type="number"
            value={squareMeters}
            onChange={(e) => setSquareMeters(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="50"
            min="1"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Year Built</label>
          <input
            type="number"
            value={yearBuilt}
            onChange={(e) => setYearBuilt(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="2020"
            min="1900"
            max="2030"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Parking Spaces</label>
          <input
            type="number"
            value={parkingSpaces}
            onChange={(e) => setParkingSpaces(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="0"
            min="0"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-4">Price</label>
        <div className="flex space-x-3">
          <div className="flex-1">
            <input
              type="text"
              value={price}
              onChange={handlePriceChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0"
            />
          </div>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="UZS">UZS</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-4">Features</label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {(Object.keys(features) as Array<keyof typeof features>).map((feature) => (
            <label key={feature} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={features[feature]}
                onChange={() => handleFeatureChange(feature)}
                className="rounded border-gray-300 text-blue-600 shadow-sm focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">
                {feature.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Property Images</h2>
        <p className="text-gray-600">Add photos to showcase your property</p>
      </div>

      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleImageChange}
          className="hidden"
          id="image-upload"
        />
        <label htmlFor="image-upload" className="cursor-pointer">
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-600 mb-2">Click to upload images</p>
          <p className="text-sm text-gray-400">Maximum 10 images, JPG, PNG or WEBP</p>
        </label>
      </div>

      {imagePreviews.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {imagePreviews.map((preview, index) => (
            <div key={index} className="relative group">
              <img
                src={preview}
                alt={`Preview ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg"
              />
              <button
                onClick={() => handleRemoveImage(index)}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
              {index === 0 && (
                <div className="absolute bottom-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                  Main
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const handleSubmit = () => {
    // Prepare the data for submission
    const propertyData = {
      // Basic Information
      title,
      description,
      propertyType,
      listingType,

      // Location
      address,
      region,
      district,
      city,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),

      // Property Details
      bedrooms: parseInt(bedrooms) || 0,
      bathrooms: parseInt(bathrooms) || 0,
      squareMeters: parseInt(squareMeters) || 0,
      floor: parseInt(floor) || 0,
      totalFloors: parseInt(totalFloors) || 0,
      yearBuilt: parseInt(yearBuilt) || null,
      parkingSpaces: parseInt(parkingSpaces) || 0,

      // Pricing
      price: price.replace(/\./g, ''), // Remove formatting
      currency,

      // Features
      features,

      // Images
      images: imageFiles
    };

    setIsSubmitting(true);

    // Here you would typically submit to your API
    console.log('Submitting property:', propertyData);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      alert('Property submitted successfully!');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {renderProgressBar()}

          <div className="min-h-[600px]">
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}
          </div>

          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className={`flex items-center px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                currentStep === 1
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
              }`}
            >
              <ChevronLeft className="w-5 h-5 mr-2" />
              Previous
            </button>

            {currentStep < totalSteps ? (
              <button
                onClick={nextStep}
                className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all duration-200"
              >
                Next
                <ChevronRight className="w-5 h-5 ml-2" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-all duration-200 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit Property
                    <DollarSign className="w-5 h-5 ml-2" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewPropertyComp;

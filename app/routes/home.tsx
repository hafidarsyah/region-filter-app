import {
  ArrowDownIcon,
  ChevronRightIcon,
  GlobeAsiaAustraliaIcon,
} from "@heroicons/react/16/solid";
import type { Route } from "./+types/home";
import { useLoaderData, useSearchParams } from "react-router";
import { BuildingOfficeIcon, FunnelIcon, MapIcon, MapPinIcon } from "@heroicons/react/24/outline";

// Meta function to set page title and description
export function meta({}: Route.MetaArgs) {
  return [
    { title: "Region Filter" },
    { name: "description", content: "Filter Indonesia regions" },
  ];
}

// Types for region data
type Province = {
  id: number;
  name: string;
};

type Regency = {
  id: number;
  name: string;
  province_id: number;
};

type District = {
  id: number;
  name: string;
  regency_id: number;
};

type LoaderData = {
  provinces: Province[];
  regencies: Regency[];
  districts: District[];
};

// Loader to fetch region data from local JSON file
export async function loader({ request }: { request: Request }) {
  const url = new URL(request.url);
  const res = await fetch(`${url.origin}/data/indonesia_regions.json`);
  const data: LoaderData = await res.json();

  return data;
}

export default function Home() {
  const { provinces, regencies, districts } = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();

  // Get selected region IDs from URL search params
  const provinceId = searchParams.get("province");
  const regencyId = searchParams.get("regency");
  const districtId = searchParams.get("district");

  // Filter regencies and districts based on selected province and regency
  const filteredRegencies = provinceId
    ? regencies.filter((r) => String(r.province_id) === provinceId)
    : [];

  const filteredDistricts = regencyId
    ? districts.filter((d) => String(d.regency_id) === regencyId)
    : [];

  // Find selected region objects for breadcrumb and display
  const selectedProvince = provinces.find((p) => String(p.id) === provinceId);
  const selectedRegency = regencies.find((r) => String(r.id) === regencyId);
  const selectedDistrict = districts.find((d) => String(d.id) === districtId);

  // Helper function to update search params and reset dependent filters
  function updateParam(key: string, value: string, reset: string[] = []) {
    const params = new URLSearchParams(searchParams);

    if (value) params.set(key, value);
    else params.delete(key);

    reset.forEach((r) => params.delete(r));

    setSearchParams(params);
  }

  const resetFilters = () => setSearchParams({});

  // Handlers for select changes that update search params and reset dependent filters
  const handleProvince = (e: React.ChangeEvent<HTMLSelectElement>) =>
    updateParam("province", e.target.value, ["regency", "district"]);

  const handleRegency = (e: React.ChangeEvent<HTMLSelectElement>) =>
    updateParam("regency", e.target.value, ["district"]);

  const handleDistrict = (e: React.ChangeEvent<HTMLSelectElement>) =>
    updateParam("district", e.target.value);

  return (
    <main>
      <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
        {/* Sidebar */}
        <aside className="w-full md:w-92 bg-white p-6 md:p-8 border-b md:border-b-0 md:border-r border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-blue-100 rounded-2xl">
              <GlobeAsiaAustraliaIcon className="w-6 h-6 text-blue-600" />
            </div>
            <span className="font-bold text-xl">Frontend Assessment</span>
          </div>

          <div className="mt-16">
            <h2 className="text-xs font-semibold text-gray-400 tracking-[2px]">
              FILTER WILAYAH
            </h2>

            <div className="space-y-8 mt-8">
              {/* Province */}
              <FilterSelect
                label="PROVINSI"
                name="province"
                value={provinceId ?? ""}
                onChange={handleProvince}
                options={provinces}
                icon={<MapIcon className="w-5 h-5" />}
              />

              {/* Regency */}
              <FilterSelect
                label="KOTA/KABUPATEN"
                name="regency"
                value={regencyId ?? ""}
                onChange={handleRegency}
                options={filteredRegencies}
                disabled={!provinceId}
                icon={<BuildingOfficeIcon className="w-5 h-5" />}
              />

              {/* District */}
              <FilterSelect
                label="KECAMATAN"
                name="district"
                value={districtId ?? ""}
                onChange={handleDistrict}
                options={filteredDistricts}
                disabled={!regencyId}
                icon={<MapPinIcon className="w-5 h-5" />}
              />
            </div>

            {/* Reset */}
            <button
              onClick={resetFilters}
              className="mt-16 flex items-center justify-center border border-blue-600 text-gray-600 rounded-2xl px-4 py-4 w-full hover:bg-blue-50 transition text-sm font-semibold tracking-[2px]"
            >
              <FunnelIcon className="w-4 h-4 mr-2" />
              RESET
            </button>
          </div>
        </aside>

        {/* Content */}
        <section className="flex-1">
          {/* Breadcrumb */}
          <nav className="breadcrumb text-gray-400 text-sm flex flex-wrap items-center gap-2 p-6 md:py-8 md:px-12 border-b border-b-gray-200 bg-white font-semibold">
            <span className="tracking-[1px]">Indonesia</span>

            {selectedProvince && (
              <>
                <span>
                  <ChevronRightIcon className="w-4 h-4" />
                </span>
                <span className="tracking-[1px]">{selectedProvince.name}</span>
              </>
            )}

            {selectedRegency && (
              <>
                <span>
                  <ChevronRightIcon className="w-4 h-4" />
                </span>
                <span className="tracking-[1px]">{selectedRegency.name}</span>
              </>
            )}

            {selectedDistrict && (
              <>
                <span>
                  <ChevronRightIcon className="w-4 h-4" />
                </span>
                <span className="tracking-[1px] text-blue-600">{selectedDistrict.name}</span>
              </>
            )}
          </nav>

          {/* Result */}
          <div className="text-center mt-12 md:mt-16">
            <RegionDisplay label="PROVINSI" value={selectedProvince?.name} />

            <RegionDisplay
              label="KOTA/KABUPATEN"
              value={selectedRegency?.name}
            />

            <RegionDisplay label="KECAMATAN" value={selectedDistrict?.name} />
          </div>
        </section>
      </div>
    </main>
  );
}

// Reusable select component for filtering regions
type SelectProps = {
  label: string;
  name: string;
  value: string;
  options: { id: number; name: string }[];
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  disabled?: boolean;
  icon?: React.ReactNode;
};

function FilterSelect({
  label,
  name,
  value,
  options,
  onChange,
  disabled,
  icon,
}: SelectProps) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-500 mb-2">
        {label}
      </label>

      <div className="flex items-center border border-gray-400 pr-4 rounded-2xl bg-white focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition">
        <div className="pl-4 pr-2 text-gray-400">
          {icon || <MapIcon className="w-5 h-5" />}
        </div>

        <select
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className="w-full py-4 bg-transparent outline-none"
        >
          <option value="">Pilih {label}</option>

          {options.map((o) => (
            <option key={o.id} value={o.id}>
              {o.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

function RegionDisplay({ label, value }: { label: string; value?: string }) {
  if (!value)
    return (
      <>
        <h4 className="text-xs font-semibold text-blue-400 mb-4 mt-10 tracking-[4px]">
          {label}
        </h4>

        <div className="text-gray-400 italic">
          Belum ada {label.toLowerCase()}
        </div>

        {label !== "KECAMATAN" && (
          <div className="mt-4 text-gray-500 italic">
            <ArrowDownIcon className="w-6 h-6 text-gray-300 mx-auto my-16" />
          </div>
        )}
      </>
    );

  return (
    <>
      <h4 className="text-xs font-semibold text-blue-400 mb-4 mt-10 tracking-[4px]">
        {label}
      </h4>

      <h1 className="text-7xl font-bold text-gray-900">{value}</h1>

      {label !== "KECAMATAN" && (
        <div className="mt-4 text-gray-500 italic">
          <ArrowDownIcon className="w-6 h-6 text-gray-300 mx-auto my-16" />
        </div>
      )}
    </>
  );
}

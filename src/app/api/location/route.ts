import { NextRequest, NextResponse } from 'next/server';

const CITY_COORDINATES: Record<string, { lat: number; lng: number; city: string; state: string }> = {
  "delhi": { lat: 28.6139, lng: 77.2090, city: "New Delhi", state: "Delhi" },
  "new delhi": { lat: 28.6139, lng: 77.2090, city: "New Delhi", state: "Delhi" },
  "mumbai": { lat: 19.0760, lng: 72.8777, city: "Mumbai", state: "Maharashtra" },
  "bengaluru": { lat: 12.9716, lng: 77.5946, city: "Bengaluru", state: "Karnataka" },
  "bangalore": { lat: 12.9716, lng: 77.5946, city: "Bengaluru", state: "Karnataka" },
  "hyderabad": { lat: 17.3850, lng: 78.4867, city: "Hyderabad", state: "Telangana" },
  "chennai": { lat: 13.0827, lng: 80.2707, city: "Chennai", state: "Tamil Nadu" },
  "kolkata": { lat: 22.5726, lng: 88.3639, city: "Kolkata", state: "West Bengal" },
  "ahmedabad": { lat: 23.0225, lng: 72.5714, city: "Ahmedabad", state: "Gujarat" },
  "pune": { lat: 18.5204, lng: 73.8567, city: "Pune", state: "Maharashtra" },
  "jaipur": { lat: 26.9124, lng: 75.7873, city: "Jaipur", state: "Rajasthan" },
  "surat": { lat: 21.1702, lng: 72.8311, city: "Surat", state: "Gujarat" },
  "lucknow": { lat: 26.8467, lng: 80.9462, city: "Lucknow", state: "Uttar Pradesh" },
  "kanpur": { lat: 26.4499, lng: 80.3319, city: "Kanpur", state: "Uttar Pradesh" },
  "nagpur": { lat: 21.1458, lng: 79.0882, city: "Nagpur", state: "Maharashtra" },
  "indore": { lat: 22.7196, lng: 75.8577, city: "Indore", state: "Madhya Pradesh" },
  "bhopal": { lat: 23.2599, lng: 77.4126, city: "Bhopal", state: "Madhya Pradesh" },
  "patna": { lat: 25.5941, lng: 85.1376, city: "Patna", state: "Bihar" },
  "vadodara": { lat: 22.3072, lng: 73.1812, city: "Vadodara", state: "Gujarat" },
  "ghaziabad": { lat: 28.6692, lng: 77.4538, city: "Ghaziabad", state: "Uttar Pradesh" },
  "ludhiana": { lat: 30.9010, lng: 75.8573, city: "Ludhiana", state: "Punjab" },
  "agra": { lat: 27.1767, lng: 78.0081, city: "Agra", state: "Uttar Pradesh" },
  "nashik": { lat: 19.9975, lng: 73.7898, city: "Nashik", state: "Maharashtra" },
  "faridabad": { lat: 28.4089, lng: 77.3178, city: "Faridabad", state: "Haryana" },
  "meerut": { lat: 28.9845, lng: 77.7064, city: "Meerut", state: "Uttar Pradesh" },
  "rajkot": { lat: 22.3039, lng: 70.8022, city: "Rajkot", state: "Gujarat" },
  "varanasi": { lat: 25.3176, lng: 82.9739, city: "Varanasi", state: "Uttar Pradesh" },
  "srinagar": { lat: 34.0837, lng: 74.7973, city: "Srinagar", state: "Jammu and Kashmir" },
  "aurangabad": { lat: 19.8762, lng: 75.3433, city: "Aurangabad", state: "Maharashtra" },
  "dhanbad": { lat: 23.7957, lng: 86.4304, city: "Dhanbad", state: "Jharkhand" },
  "amritsar": { lat: 31.6340, lng: 74.8723, city: "Amritsar", state: "Punjab" },
  "navi mumbai": { lat: 19.0330, lng: 73.0297, city: "Navi Mumbai", state: "Maharashtra" },
  "allahabad": { lat: 25.4358, lng: 81.8463, city: "Prayagraj", state: "Uttar Pradesh" },
  "prayagraj": { lat: 25.4358, lng: 81.8463, city: "Prayagraj", state: "Uttar Pradesh" },
  "ranchi": { lat: 23.3441, lng: 85.3096, city: "Ranchi", state: "Jharkhand" },
  "howrah": { lat: 22.5958, lng: 88.2636, city: "Howrah", state: "West Bengal" },
  "coimbatore": { lat: 11.0168, lng: 76.9558, city: "Coimbatore", state: "Tamil Nadu" },
  "jabalpur": { lat: 23.1815, lng: 79.9864, city: "Jabalpur", state: "Madhya Pradesh" },
  "gwalior": { lat: 26.2183, lng: 78.1828, city: "Gwalior", state: "Madhya Pradesh" },
  "vijayawada": { lat: 16.5062, lng: 80.6480, city: "Vijayawada", state: "Andhra Pradesh" },
  "jodhpur": { lat: 26.2389, lng: 73.0243, city: "Jodhpur", state: "Rajasthan" },
  "madurai": { lat: 9.9252, lng: 78.1198, city: "Madurai", state: "Tamil Nadu" },
  "raipur": { lat: 21.2514, lng: 81.6296, city: "Raipur", state: "Chhattisgarh" },
  "kota": { lat: 25.2138, lng: 75.8648, city: "Kota", state: "Rajasthan" },
  "guwahati": { lat: 26.1445, lng: 91.7362, city: "Guwahati", state: "Assam" },
  "chandigarh": { lat: 30.7333, lng: 76.7794, city: "Chandigarh", state: "Chandigarh" },
  "bhubaneswar": { lat: 20.2961, lng: 85.8245, city: "Bhubaneswar", state: "Odisha" },
  "thiruvananthapuram": { lat: 8.5241, lng: 76.9366, city: "Thiruvananthapuram", state: "Kerala" },
  "kochi": { lat: 9.9312, lng: 76.2673, city: "Kochi", state: "Kerala" },
  "dehradun": { lat: 30.3165, lng: 78.0322, city: "Dehradun", state: "Uttarakhand" },
  "shimla": { lat: 31.1048, lng: 77.1734, city: "Shimla", state: "Himachal Pradesh" },
  "panaji": { lat: 15.4909, lng: 73.8278, city: "Panaji", state: "Goa" },
  "gandhinagar": { lat: 23.2156, lng: 72.6369, city: "Gandhinagar", state: "Gujarat" },
  "noida": { lat: 28.5355, lng: 77.3910, city: "Noida", state: "Uttar Pradesh" },
  "gurugram": { lat: 28.4595, lng: 77.0266, city: "Gurugram", state: "Haryana" },
  "gurgaon": { lat: 28.4595, lng: 77.0266, city: "Gurugram", state: "Haryana" },
  // States
  "gujarat": { lat: 22.2587, lng: 71.1924, city: "Ahmedabad", state: "Gujarat" },
  "maharashtra": { lat: 19.7515, lng: 75.7139, city: "Mumbai", state: "Maharashtra" },
  "rajasthan": { lat: 27.0238, lng: 74.2179, city: "Jaipur", state: "Rajasthan" },
  "karnataka": { lat: 15.3173, lng: 75.7139, city: "Bengaluru", state: "Karnataka" },
  "tamil nadu": { lat: 11.1271, lng: 78.6569, city: "Chennai", state: "Tamil Nadu" },
  "uttar pradesh": { lat: 26.8467, lng: 80.9462, city: "Lucknow", state: "Uttar Pradesh" },
  "west bengal": { lat: 22.9868, lng: 87.8550, city: "Kolkata", state: "West Bengal" },
  "madhya pradesh": { lat: 22.9734, lng: 78.6569, city: "Bhopal", state: "Madhya Pradesh" },
  "bihar": { lat: 25.0961, lng: 85.3131, city: "Patna", state: "Bihar" },
  "punjab": { lat: 31.1471, lng: 75.3412, city: "Ludhiana", state: "Punjab" },
  "haryana": { lat: 29.0588, lng: 76.0856, city: "Gurugram", state: "Haryana" },
  "andhra pradesh": { lat: 15.9129, lng: 79.7400, city: "Vijayawada", state: "Andhra Pradesh" },
  "telangana": { lat: 18.1124, lng: 79.0193, city: "Hyderabad", state: "Telangana" },
  "kerala": { lat: 10.8505, lng: 76.2711, city: "Kochi", state: "Kerala" },
  "odisha": { lat: 20.9517, lng: 85.0985, city: "Bhubaneswar", state: "Odisha" },
  "assam": { lat: 26.2006, lng: 92.9376, city: "Guwahati", state: "Assam" },
  "jharkhand": { lat: 23.6102, lng: 85.2799, city: "Ranchi", state: "Jharkhand" },
  "chhattisgarh": { lat: 21.2787, lng: 81.8661, city: "Raipur", state: "Chhattisgarh" },
  "uttarakhand": { lat: 30.0668, lng: 79.0193, city: "Dehradun", state: "Uttarakhand" },
  "himachal pradesh": { lat: 31.1048, lng: 77.1734, city: "Shimla", state: "Himachal Pradesh" },
  "goa": { lat: 15.2993, lng: 74.1240, city: "Panaji", state: "Goa" },
  "jammu and kashmir": { lat: 33.7782, lng: 76.5762, city: "Srinagar", state: "Jammu and Kashmir" }
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const requestedIp = searchParams.get('ip');
  const cityHint = searchParams.get('city');

  // If explicit city/state hint is provided, resolve directly
  if (cityHint && cityHint.trim()) {
    const query = cityHint.toLowerCase().trim();
    for (const [k, v] of Object.entries(CITY_COORDINATES)) {
      if (query.includes(k) || k.includes(query)) {
        return NextResponse.json({
          success: true,
          ip: requestedIp || '103.21.244.18',
          city: v.city,
          region: v.state,
          country: 'India',
          lat: v.lat,
          lng: v.lng,
          source: 'city-lookup'
        });
      }
    }
  }

  // Extract client IP from headers if not explicitly supplied
  let ip = requestedIp?.trim() || '';
  if (!ip) {
    const forwarded = req.headers.get('x-forwarded-for');
    ip = forwarded ? forwarded.split(',')[0].trim() : req.headers.get('x-real-ip') || '';
  }

  // If localhost IP or empty, use public network IP lookup
  const isLocal = !ip || ip === '::1' || ip === '127.0.0.1' || ip.startsWith('192.168.') || ip.startsWith('10.');

  try {
    // 1. If public IP or empty local, try IP Geolocation lookup
    const lookupTarget = (!isLocal && ip) ? `/${ip}` : '';
    const geoRes = await fetch(`https://ipapi.co${lookupTarget}/json/`, {
      headers: { 'User-Agent': 'AxiomProcurePortal/1.0' },
      next: { revalidate: 3600 }
    });

    if (geoRes.ok) {
      const geoData = await geoRes.json();
      if (geoData && !geoData.error && geoData.latitude && geoData.longitude) {
        return NextResponse.json({
          success: true,
          ip: geoData.ip || ip || '103.21.244.0',
          city: geoData.city || 'New Delhi',
          region: geoData.region || 'Delhi',
          country: geoData.country_name || 'India',
          lat: Number(geoData.latitude),
          lng: Number(geoData.longitude),
          source: 'ip-geolocation'
        });
      }
    }
  } catch (err) {
    console.warn('Primary IP Geolocation failed, using city dictionary fallback:', err);
  }

  // 2. City Hint or Default Fallback
  const key = (cityHint || 'delhi').toLowerCase().trim();
  const matched = CITY_COORDINATES[key] || CITY_COORDINATES['new delhi'];

  return NextResponse.json({
    success: true,
    ip: ip && !isLocal ? ip : '103.21.244.18',
    city: matched.city,
    region: matched.state,
    country: 'India',
    lat: matched.lat,
    lng: matched.lng,
    source: 'regional-fallback'
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { ip, city, state } = body;

    // Search by city/state first if provided
    if (city || state) {
      const query = (city || state || '').toLowerCase().trim();
      for (const [k, v] of Object.entries(CITY_COORDINATES)) {
        if (query.includes(k) || k.includes(query)) {
          return NextResponse.json({
            success: true,
            ip: ip || '103.21.244.18',
            city: v.city,
            region: v.state,
            country: 'India',
            lat: v.lat,
            lng: v.lng,
            source: 'city-lookup'
          });
        }
      }
    }

    // Lookup by IP
    if (ip) {
      const geoRes = await fetch(`https://ipapi.co/${ip.trim()}/json/`, {
        headers: { 'User-Agent': 'AxiomProcurePortal/1.0' }
      });
      if (geoRes.ok) {
        const geoData = await geoRes.json();
        if (geoData && !geoData.error && geoData.latitude) {
          return NextResponse.json({
            success: true,
            ip: geoData.ip || ip,
            city: geoData.city || 'Mumbai',
            region: geoData.region || 'Maharashtra',
            country: geoData.country_name || 'India',
            lat: Number(geoData.latitude),
            lng: Number(geoData.longitude),
            source: 'ip-geolocation'
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      ip: ip || '103.21.244.18',
      city: 'New Delhi',
      region: 'Delhi',
      country: 'India',
      lat: 28.6139,
      lng: 77.2090,
      source: 'default'
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || 'Location resolution failed' },
      { status: 500 }
    );
  }
}

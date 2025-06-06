// utils/cors.ts
import { NextResponse } from 'next/server';

// Function to add CORS headers
export function addCorsHeaders(response: NextResponse) {
    response.headers.set('Access-Control-Allow-Origin', '*'); // In production, set this to your specific Figma plugin origin
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
    return response;
}

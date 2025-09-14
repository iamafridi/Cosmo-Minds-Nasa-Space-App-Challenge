import React from 'react';
import { X } from 'lucide-react';

const LocationModal = ({ location, isOpen, onClose }) => {
    if (!isOpen || !location) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 m-4 max-w-md w-full border border-slate-700 shadow-2xl transform transition-all duration-300 scale-100">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white">{location.name}</h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-slate-700 transition-colors duration-200 text-slate-400 hover:text-white"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="bg-slate-800 rounded-lg p-3 border border-slate-600">
                            <span className="text-slate-400 block mb-1">Latitude</span>
                            <span className="text-white font-mono">{location.lat.toFixed(4)}°</span>
                        </div>
                        <div className="bg-slate-800 rounded-lg p-3 border border-slate-600">
                            <span className="text-slate-400 block mb-1">Longitude</span>
                            <span className="text-white font-mono">{location.lng.toFixed(4)}°</span>
                        </div>
                    </div>

                    <div className="bg-slate-800 rounded-lg p-4 border border-slate-600">
                        <h3 className="text-white font-semibold mb-2">Location Info</h3>
                        <p className="text-slate-300 text-sm leading-relaxed">
                            {location.description || "This is a key location in our global network. Click and explore the connections that span across continents."}
                        </p>
                    </div>

                    {/* Stats or additional info */}
                    <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="bg-blue-900/30 rounded-lg p-3 border border-blue-700/50">
                            <div className="text-blue-400 text-xs uppercase tracking-wide">Timezone</div>
                            <div className="text-white font-semibold text-sm mt-1">{location.timezone || 'UTC+0'}</div>
                        </div>
                        <div className="bg-green-900/30 rounded-lg p-3 border border-green-700/50">
                            <div className="text-green-400 text-xs uppercase tracking-wide">Status</div>
                            <div className="text-white font-semibold text-sm mt-1">Active</div>
                        </div>
                        <div className="bg-purple-900/30 rounded-lg p-3 border border-purple-700/50">
                            <div className="text-purple-400 text-xs uppercase tracking-wide">Region</div>
                            <div className="text-white font-semibold text-sm mt-1">{location.region || 'Global'}</div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="mt-6 flex gap-3">
                    <button className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 px-4 rounded-lg font-medium transition-all duration-200 transform hover:scale-105">
                        Connect
                    </button>
                    <button
                        onClick={onClose}
                        className="px-6 py-3 border border-slate-600 text-slate-300 rounded-lg hover:bg-slate-700 hover:text-white transition-colors duration-200"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LocationModal;
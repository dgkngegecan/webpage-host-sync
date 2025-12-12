'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useLoader, useThree } from '@react-three/fiber';
import { OrbitControls, Stage, Center } from '@react-three/drei';
import * as THREE from 'three';
import { STLLoader } from 'three-stdlib';
import { OBJLoader } from 'three-stdlib';

interface ModelViewerProps {
    file: File | null;
    color: string;
    onGeometryLoaded?: (geometry: THREE.BufferGeometry) => void;
}

function Model({ file, color, onGeometryLoaded }: ModelViewerProps) {
    const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null);

    useEffect(() => {
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const buffer = e.target?.result as ArrayBuffer;
            if (!buffer) return;

            try {
                let geom: THREE.BufferGeometry | null = null;

                if (file.name.toLowerCase().endsWith('.stl')) {
                    const loader = new STLLoader();
                    geom = loader.parse(buffer);
                } else if (file.name.toLowerCase().endsWith('.obj')) {
                    const loader = new OBJLoader();
                    const object = loader.parse(new TextDecoder().decode(buffer));
                    // Extract geometry from OBJ
                    object.traverse((child) => {
                        if ((child as THREE.Mesh).isMesh) {
                            geom = (child as THREE.Mesh).geometry;
                        }
                    });
                }

                if (geom) {
                    geom.center();
                    geom.computeBoundingBox();
                    setGeometry(geom);
                    if (onGeometryLoaded) {
                        onGeometryLoaded(geom);
                    }
                }
            } catch (error) {
                console.error('Error loading model:', error);
            }
        };

        reader.readAsArrayBuffer(file);
    }, [file, onGeometryLoaded]);

    if (!geometry) return null;

    return (
        <mesh geometry={geometry} castShadow receiveShadow>
            <meshStandardMaterial color={color} roughness={0.5} metalness={0.1} />
        </mesh>
    );
}

export default function ModelViewer({ file, color, onGeometryLoaded }: ModelViewerProps) {
    return (
        <div className="h-[400px] w-full rounded-xl bg-bg-secondary/30 border border-border overflow-hidden relative">
            {!file && (
                <div className="absolute inset-0 flex items-center justify-center text-text-secondary">
                    <div className="text-center">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="mx-auto h-12 w-12 mb-2 opacity-50">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
                        </svg>
                        <p>Önizleme için bir dosya yükleyin</p>
                    </div>
                </div>
            )}
            <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 0, 150], fov: 50 }}>
                <React.Suspense fallback={null}>
                    <Stage environment="city" intensity={0.6}>
                        {file && <Model file={file} color={color} onGeometryLoaded={onGeometryLoaded} />}
                    </Stage>
                </React.Suspense>
                <OrbitControls autoRotate={false} makeDefault />
            </Canvas>
        </div>
    );
}

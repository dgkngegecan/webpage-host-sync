import * as THREE from 'three';

export function calculateVolume(geometry: THREE.BufferGeometry): number {
    let volume = 0;
    const position = geometry.attributes.position;
    const faces = position.count / 3;

    const p1 = new THREE.Vector3();
    const p2 = new THREE.Vector3();
    const p3 = new THREE.Vector3();

    for (let i = 0; i < faces; i++) {
        p1.fromBufferAttribute(position, i * 3 + 0);
        p2.fromBufferAttribute(position, i * 3 + 1);
        p3.fromBufferAttribute(position, i * 3 + 2);

        volume += signedVolumeOfTriangle(p1, p2, p3);
    }

    return Math.abs(volume) / 1000; // Convert mm³ to cm³
}

function signedVolumeOfTriangle(p1: THREE.Vector3, p2: THREE.Vector3, p3: THREE.Vector3): number {
    return p1.dot(p2.cross(p3)) / 6.0;
}

export function calculateBoundingBox(geometry: THREE.BufferGeometry): THREE.Vector3 {
    geometry.computeBoundingBox();
    const box = geometry.boundingBox;
    if (!box) return new THREE.Vector3(0, 0, 0);

    const size = new THREE.Vector3();
    box.getSize(size);
    return size;
}

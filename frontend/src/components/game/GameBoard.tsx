import React, { forwardRef, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

interface Realm {
  id: string;
  name: string;
  type: string;
  position: {
    x: number;
    y: number;
    z: number;
  };
  resources: string[];
  stability: number;
  techLevel: number;
  activeQuest?: any;
}

interface Player {
  id: string;
  username: string;
  role: string;
  color: string;
  currentRealmId: string;
}

interface GameBoardProps {
  realms: Realm[];
  players: Player[];
  currentPlayerId: string;
  selectedRealm: string | null;
  isUserTurn: boolean;
  onRealmSelect: (realmId: string) => void;
  onMove: (realmId: string) => void;
}

/**
 * Game board component using Three.js for 3D visualization
 */
const GameBoard = forwardRef<HTMLDivElement, GameBoardProps>(({
  realms = [],
  players = [],
  currentPlayerId,
  selectedRealm,
  isUserTurn,
  onRealmSelect,
  onMove
}, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const realmMeshesRef = useRef<Map<string, THREE.Mesh>>(new Map());
  const playerMeshesRef = useRef<Map<string, THREE.Mesh>>(new Map());
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2());
  const [hoveredRealm, setHoveredRealm] = useState<string | null>(null);
  const [realmInfo, setRealmInfo] = useState<Realm | null>(null);

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current) return;

    // Create scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111827);
    sceneRef.current = scene;

    // Create camera
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 15, 15);
    cameraRef.current = camera;

    // Create renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Add orbit controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 5;
    controls.maxDistance = 30;
    controls.maxPolarAngle = Math.PI / 2;
    controlsRef.current = controls;

    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    scene.add(ambientLight);

    // Add directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Add grid helper
    const gridHelper = new THREE.GridHelper(30, 30, 0x555555, 0x333333);
    scene.add(gridHelper);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      
      if (controlsRef.current) {
        controlsRef.current.update();
      }
      
      if (rendererRef.current && cameraRef.current && sceneRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };
    
    animate();

    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;
      
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      
      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      
      rendererRef.current.setSize(width, height);
    };
    
    window.addEventListener('resize', handleResize);

    // Handle mouse move for raycasting
    const handleMouseMove = (event: MouseEvent) => {
      if (!containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      mouseRef.current.x = ((event.clientX - rect.left) / containerRef.current.clientWidth) * 2 - 1;
      mouseRef.current.y = -((event.clientY - rect.top) / containerRef.current.clientHeight) * 2 + 1;
      
      checkIntersection();
    };
    
    containerRef.current.addEventListener('mousemove', handleMouseMove);

    // Handle click for realm selection
    const handleClick = () => {
      if (hoveredRealm) {
        onRealmSelect(hoveredRealm);
      }
    };
    
    containerRef.current.addEventListener('click', handleClick);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      
      if (containerRef.current) {
        containerRef.current.removeEventListener('mousemove', handleMouseMove);
        containerRef.current.removeEventListener('click', handleClick);
        
        if (rendererRef.current) {
          containerRef.current.removeChild(rendererRef.current.domElement);
        }
      }
      
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
    };
  }, [onRealmSelect]);

  // Create or update realms
  useEffect(() => {
    if (!sceneRef.current) return;

    // Clear existing realm meshes
    realmMeshesRef.current.forEach((mesh) => {
      sceneRef.current?.remove(mesh);
    });
    realmMeshesRef.current.clear();

    // Create realm meshes
    realms.forEach((realm) => {
      // Create realm geometry based on type
      let geometry;
      switch (realm.type) {
        case 'tech':
          geometry = new THREE.CylinderGeometry(1, 1, 0.5, 6);
          break;
        case 'nature':
          geometry = new THREE.SphereGeometry(1, 32, 32);
          break;
        case 'urban':
          geometry = new THREE.BoxGeometry(1.5, 0.5, 1.5);
          break;
        case 'void':
          geometry = new THREE.TorusGeometry(1, 0.3, 16, 32);
          break;
        default:
          geometry = new THREE.CylinderGeometry(1, 1, 0.5, 32);
      }

      // Create material based on stability
      const stabilityColor = new THREE.Color(
        Math.max(0, 1 - realm.stability / 100),
        Math.min(1, realm.stability / 100),
        0.5
      );
      
      const material = new THREE.MeshStandardMaterial({
        color: stabilityColor,
        metalness: realm.techLevel / 100,
        roughness: 1 - realm.techLevel / 100,
      });

      // Create mesh
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(
        realm.position.x,
        realm.position.y + 0.25,
        realm.position.z
      );
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.userData = { id: realm.id, type: 'realm' };

      // Add to scene and store reference
      sceneRef.current.add(mesh);
      realmMeshesRef.current.set(realm.id, mesh);

      // Add realm name label
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (context) {
        canvas.width = 256;
        canvas.height = 64;
        context.fillStyle = '#000000';
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.font = '24px Arial';
        context.textAlign = 'center';
        context.fillStyle = '#ffffff';
        context.fillText(realm.name, canvas.width / 2, canvas.height / 2 + 8);

        const texture = new THREE.CanvasTexture(canvas);
        const labelMaterial = new THREE.SpriteMaterial({ map: texture });
        const label = new THREE.Sprite(labelMaterial);
        label.position.set(realm.position.x, realm.position.y + 1.5, realm.position.z);
        label.scale.set(4, 1, 1);
        sceneRef.current.add(label);
      }

      // Add connections between realms (for adjacent realms)
      // This is a simplified approach - in a real game, you'd have a proper adjacency graph
      realms.forEach((otherRealm) => {
        if (realm.id === otherRealm.id) return;
        
        // Simple distance check to determine if realms are adjacent
        const distance = Math.sqrt(
          Math.pow(realm.position.x - otherRealm.position.x, 2) +
          Math.pow(realm.position.z - otherRealm.position.z, 2)
        );
        
        if (distance < 8) {
          const points = [
            new THREE.Vector3(realm.position.x, realm.position.y, realm.position.z),
            new THREE.Vector3(otherRealm.position.x, otherRealm.position.y, otherRealm.position.z)
          ];
          
          const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
          const lineMaterial = new THREE.LineBasicMaterial({ color: 0x444444 });
          const line = new THREE.Line(lineGeometry, lineMaterial);
          
          sceneRef.current.add(line);
        }
      });

      // Add quest indicator if realm has an active quest
      if (realm.activeQuest) {
        const questGeometry = new THREE.OctahedronGeometry(0.5, 0);
        const questMaterial = new THREE.MeshStandardMaterial({ 
          color: 0xffcc00,
          emissive: 0xffcc00,
          emissiveIntensity: 0.5
        });
        const questMesh = new THREE.Mesh(questGeometry, questMaterial);
        questMesh.position.set(
          realm.position.x,
          realm.position.y + 2,
          realm.position.z
        );
        
        // Add floating animation
        const animate = () => {
          questMesh.position.y = realm.position.y + 2 + Math.sin(Date.now() * 0.002) * 0.2;
          questMesh.rotation.y += 0.01;
          requestAnimationFrame(animate);
        };
        animate();
        
        sceneRef.current.add(questMesh);
      }
    });

    // Update selected realm visual
    if (selectedRealm) {
      const selectedMesh = realmMeshesRef.current.get(selectedRealm);
      if (selectedMesh) {
        // Add highlight effect
        const highlightGeometry = new THREE.RingGeometry(1.5, 1.7, 32);
        const highlightMaterial = new THREE.MeshBasicMaterial({ 
          color: 0xffffff,
          side: THREE.DoubleSide
        });
        const highlightMesh = new THREE.Mesh(highlightGeometry, highlightMaterial);
        highlightMesh.position.set(
          selectedMesh.position.x,
          selectedMesh.position.y + 0.1,
          selectedMesh.position.z
        );
        highlightMesh.rotation.x = Math.PI / 2;
        sceneRef.current.add(highlightMesh);
        
        // Find and display realm info
        const realm = realms.find(r => r.id === selectedRealm);
        if (realm) {
          setRealmInfo(realm);
        }
      }
    } else {
      setRealmInfo(null);
    }
  }, [realms, selectedRealm]);

  // Create or update player tokens
  useEffect(() => {
    if (!sceneRef.current) return;

    // Clear existing player meshes
    playerMeshesRef.current.forEach((mesh) => {
      sceneRef.current?.remove(mesh);
    });
    playerMeshesRef.current.clear();

    // Create player meshes
    players.forEach((player, index) => {
      const realm = realms.find(r => r.id === player.currentRealmId);
      if (!realm) return;

      // Create player token
      const geometry = new THREE.ConeGeometry(0.5, 1, 8);
      const material = new THREE.MeshStandardMaterial({ 
        color: player.color || 0xff0000,
        emissive: player.color || 0xff0000,
        emissiveIntensity: player.id === currentPlayerId ? 0.5 : 0.2
      });
      
      const mesh = new THREE.Mesh(geometry, material);
      
      // Position player token on the realm with slight offset based on player index
      const angle = (index / players.length) * Math.PI * 2;
      const offsetX = Math.cos(angle) * 0.8;
      const offsetZ = Math.sin(angle) * 0.8;
      
      mesh.position.set(
        realm.position.x + offsetX,
        realm.position.y + 1,
        realm.position.z + offsetZ
      );
      
      mesh.userData = { id: player.id, type: 'player' };
      
      // Add to scene and store reference
      sceneRef.current.add(mesh);
      playerMeshesRef.current.set(player.id, mesh);
    });
  }, [players, currentPlayerId, realms]);

  // Raycasting for hover effects
  const checkIntersection = () => {
    if (!sceneRef.current || !cameraRef.current) return;
    
    raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
    
    const intersects = raycasterRef.current.intersectObjects(
      Array.from(realmMeshesRef.current.values())
    );
    
    if (intersects.length > 0) {
      const mesh = intersects[0].object as THREE.Mesh;
      const realmId = mesh.userData.id;
      
      if (hoveredRealm !== realmId) {
        // Reset previous hover effect
        if (hoveredRealm) {
          const prevMesh = realmMeshesRef.current.get(hoveredRealm);
          if (prevMesh && prevMesh.material instanceof THREE.MeshStandardMaterial) {
            prevMesh.material.emissive.set(0x000000);
          }
        }
        
        // Apply hover effect
        if (mesh.material instanceof THREE.MeshStandardMaterial) {
          mesh.material.emissive.set(0x333333);
        }
        
        setHoveredRealm(realmId);
      }
    } else if (hoveredRealm) {
      // Reset hover effect when not hovering any realm
      const prevMesh = realmMeshesRef.current.get(hoveredRealm);
      if (prevMesh && prevMesh.material instanceof THREE.MeshStandardMaterial) {
        prevMesh.material.emissive.set(0x000000);
      }
      
      setHoveredRealm(null);
    }
  };

  // Handle move to realm
  const handleMoveToRealm = () => {
    if (selectedRealm && isUserTurn) {
      onMove(selectedRealm);
    }
  };

  return (
    <div className="card flex flex-col h-full">
      {/* 3D board container */}
      <div 
        ref={(node) => {
          containerRef.current = node;
          if (typeof ref === 'function') {
            ref(node);
          } else if (ref) {
            ref.current = node;
          }
        }}
        className="flex-1 relative"
      />
      
      {/* Realm info panel */}
      {realmInfo && (
        <div className="p-4 bg-dark-800 border-t border-dark-600">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold">{realmInfo.name}</h3>
              <p className="text-sm text-gray-400">Type: {realmInfo.type}</p>
            </div>
            {isUserTurn && (
              <button
                onClick={handleMoveToRealm}
                className="btn-primary btn-sm"
                disabled={!selectedRealm}
              >
                Move Here
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-2 mt-3">
            <div>
              <p className="text-xs text-gray-500">Stability</p>
              <div className="w-full bg-dark-700 rounded-full h-2 mt-1">
                <div 
                  className="bg-gradient-to-r from-red-500 to-green-500 h-2 rounded-full" 
                  style={{ width: `${realmInfo.stability}%` }}
                />
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500">Tech Level</p>
              <div className="w-full bg-dark-700 rounded-full h-2 mt-1">
                <div 
                  className="bg-tech-500 h-2 rounded-full" 
                  style={{ width: `${realmInfo.techLevel}%` }}
                />
              </div>
            </div>
          </div>
          
          {realmInfo.resources.length > 0 && (
            <div className="mt-3">
              <p className="text-xs text-gray-500">Resources</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {realmInfo.resources.map((resource, index) => (
                  <span 
                    key={index}
                    className="text-xs px-2 py-1 bg-dark-700 rounded-full"
                  >
                    {resource}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {realmInfo.activeQuest && (
            <div className="mt-3 text-sm">
              <p className="text-yellow-500">
                <span className="inline-block w-2 h-2 bg-yellow-500 rounded-full mr-1"></span>
                Active Quest Available
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
});

export default GameBoard;

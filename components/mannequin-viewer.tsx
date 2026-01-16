"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import * as THREE from "three"
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js"
import { Button } from "@/components/ui/button"

type ModelType = "male" | "female"

export default function MannequinViewer() {
  const maleContainerRef = useRef<HTMLDivElement>(null)
  const femaleContainerRef = useRef<HTMLDivElement>(null)

  const maleSceneRef = useRef<THREE.Scene | null>(null)
  const maleCameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const maleRendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const malePlatformRef = useRef<THREE.Group | null>(null)
  const maleAnimationFrameRef = useRef<number | null>(null)

  const femaleSceneRef = useRef<THREE.Scene | null>(null)
  const femaleCameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const femaleRendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const femalePlatformRef = useRef<THREE.Group | null>(null)
  const femaleAnimationFrameRef = useRef<number | null>(null)

  const [activeModel, setActiveModel] = useState<ModelType>("male")
  const [isLoading, setIsLoading] = useState(true)

  const loadGLBModel = async (): Promise<THREE.Group | null> => {
    return new Promise((resolve) => {
      const loader = new GLTFLoader()
      loader.load(
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/uploads_files_4928388_radyplayer%2Bme%2Bcasual%2Bman-l0gO8ZEmTvzSfk1t9y1EBLgNpycRjY.glb",
        (gltf) => {
          const model = gltf.scene

          // Calculate bounding box to position model on platform
          const box = new THREE.Box3().setFromObject(model)
          const size = new THREE.Vector3()
          box.getSize(size)

          // Scale model if needed
          const desiredHeight = 1.8
          const currentHeight = size.y
          const scale = desiredHeight / currentHeight
          model.scale.set(scale, scale, scale)

          // Recalculate position after scaling
          const newBox = new THREE.Box3().setFromObject(model)
          const newBottomY = newBox.min.y
          // Position so bottom touches platform at y = -0.475
          model.position.y = -0.475 - newBottomY

          resolve(model)
        },
        undefined,
        (error) => {
          console.error("Error loading GLB model:", error)
          resolve(null)
        },
      )
    })
  }

  const createRealisticHumanoid = (type: ModelType): THREE.Group => {
    const group = new THREE.Group()

    const isMale = type === "male"
    const skinColor = isMale ? 0xf4c2a0 : 0xffd5ba
    const clothingColor = isMale ? 0x2c5f8d : 0x8d2c5f

    const material = new THREE.MeshStandardMaterial({
      color: skinColor,
      roughness: 0.7,
      metalness: 0.1,
    })

    const clothingMaterial = new THREE.MeshStandardMaterial({
      color: clothingColor,
      roughness: 0.8,
      metalness: 0.0,
    })

    // Head
    const headGeometry = new THREE.SphereGeometry(0.13, 32, 32)
    headGeometry.scale(1, 1.15, 1)
    const head = new THREE.Mesh(headGeometry, material)
    head.position.y = 1.68
    group.add(head)

    // Neck
    const neckGeometry = new THREE.CylinderGeometry(0.055, 0.065, 0.12, 16)
    const neck = new THREE.Mesh(neckGeometry, material)
    neck.position.y = 1.56
    group.add(neck)

    // Upper torso
    const chestWidth = isMale ? 0.22 : 0.19
    const chestDepth = isMale ? 0.15 : 0.14
    const chestGeometry = new THREE.BoxGeometry(chestWidth, 0.35, chestDepth, 8, 8, 8)
    const chest = new THREE.Mesh(chestGeometry, clothingMaterial)
    chest.position.y = 1.3
    group.add(chest)

    // Shoulders
    const shoulderGeometry = new THREE.SphereGeometry(0.08, 16, 16)
    const leftShoulder = new THREE.Mesh(shoulderGeometry, clothingMaterial)
    leftShoulder.position.set(-0.18, 1.42, 0)
    group.add(leftShoulder)

    const rightShoulder = new THREE.Mesh(shoulderGeometry, clothingMaterial)
    rightShoulder.position.set(0.18, 1.42, 0)
    group.add(rightShoulder)

    // Abdomen
    const abdomenWidth = isMale ? 0.2 : 0.17
    const abdomenGeometry = new THREE.BoxGeometry(abdomenWidth, 0.25, 0.13, 8, 8, 8)
    const abdomen = new THREE.Mesh(abdomenGeometry, clothingMaterial)
    abdomen.position.y = 1.0
    group.add(abdomen)

    // Hips
    const hipsWidth = isMale ? 0.2 : 0.22
    const hipsGeometry = new THREE.BoxGeometry(hipsWidth, 0.18, 0.14, 8, 8, 8)
    const hips = new THREE.Mesh(hipsGeometry, clothingMaterial)
    hips.position.y = 0.78
    group.add(hips)

    // Upper arms
    const armLength = 0.28
    const upperArmGeometry = new THREE.CylinderGeometry(0.045, 0.04, armLength, 16)

    const leftUpperArm = new THREE.Mesh(upperArmGeometry, material)
    leftUpperArm.position.set(-0.24, 1.28, 0)
    group.add(leftUpperArm)

    const rightUpperArm = new THREE.Mesh(upperArmGeometry, material)
    rightUpperArm.position.set(0.24, 1.28, 0)
    group.add(rightUpperArm)

    // Elbows
    const elbowGeometry = new THREE.SphereGeometry(0.042, 12, 12)
    const leftElbow = new THREE.Mesh(elbowGeometry, material)
    leftElbow.position.set(-0.24, 1.14, 0)
    group.add(leftElbow)

    const rightElbow = new THREE.Mesh(elbowGeometry, material)
    rightElbow.position.set(0.24, 1.14, 0)
    group.add(rightElbow)

    // Forearms
    const forearmGeometry = new THREE.CylinderGeometry(0.038, 0.035, 0.26, 16)

    const leftForearm = new THREE.Mesh(forearmGeometry, material)
    leftForearm.position.set(-0.24, 0.88, 0)
    group.add(leftForearm)

    const rightForearm = new THREE.Mesh(forearmGeometry, material)
    rightForearm.position.set(0.24, 0.88, 0)
    group.add(rightForearm)

    // Hands
    const handGeometry = new THREE.BoxGeometry(0.06, 0.1, 0.04, 4, 4, 4)

    const leftHand = new THREE.Mesh(handGeometry, material)
    leftHand.position.set(-0.24, 0.7, 0)
    group.add(leftHand)

    const rightHand = new THREE.Mesh(handGeometry, material)
    rightHand.position.set(0.24, 0.7, 0)
    group.add(rightHand)

    // Upper legs
    const thighGeometry = new THREE.CylinderGeometry(0.075, 0.065, 0.42, 16)

    const leftThigh = new THREE.Mesh(thighGeometry, clothingMaterial)
    leftThigh.position.set(-0.09, 0.48, 0)
    group.add(leftThigh)

    const rightThigh = new THREE.Mesh(thighGeometry, clothingMaterial)
    rightThigh.position.set(0.09, 0.48, 0)
    group.add(rightThigh)

    // Knees
    const kneeGeometry = new THREE.SphereGeometry(0.055, 12, 12)
    const leftKnee = new THREE.Mesh(kneeGeometry, material)
    leftKnee.position.set(-0.09, 0.27, 0)
    group.add(leftKnee)

    const rightKnee = new THREE.Mesh(kneeGeometry, material)
    rightKnee.position.set(0.09, 0.27, 0)
    group.add(rightKnee)

    // Lower legs
    const shinGeometry = new THREE.CylinderGeometry(0.055, 0.048, 0.4, 16)

    const leftShin = new THREE.Mesh(shinGeometry, material)
    leftShin.position.set(-0.09, 0.07, 0)
    group.add(leftShin)

    const rightShin = new THREE.Mesh(shinGeometry, material)
    rightShin.position.set(0.09, 0.07, 0)
    group.add(rightShin)

    // Feet
    const footGeometry = new THREE.BoxGeometry(0.08, 0.06, 0.18, 4, 4, 4)

    const leftFoot = new THREE.Mesh(footGeometry, material)
    leftFoot.position.set(-0.09, -0.14, 0.04)
    group.add(leftFoot)

    const rightFoot = new THREE.Mesh(footGeometry, material)
    rightFoot.position.set(0.09, -0.14, 0.04)
    group.add(rightFoot)

    return group
  }

  const createPlatform = (): THREE.Group => {
    const group = new THREE.Group()

    // Main disk
    const diskGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.05, 32)
    const diskMaterial = new THREE.MeshPhongMaterial({
      color: 0xe0e0e0,
      flatShading: false,
    })
    const disk = new THREE.Mesh(diskGeometry, diskMaterial)
    disk.position.y = -0.5
    group.add(disk)

    // Vertical lines on edge
    const lineCount = 32
    const radius = 0.5
    const lineHeight = 0.05

    for (let i = 0; i < lineCount; i++) {
      const angle = (i / lineCount) * Math.PI * 2
      const x = Math.cos(angle) * radius
      const z = Math.sin(angle) * radius

      const lineGeometry = new THREE.BoxGeometry(0.001, lineHeight, 0.001)
      const lineMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 })
      const line = new THREE.Mesh(lineGeometry, lineMaterial)
      line.position.set(x, -0.5, z)
      group.add(line)
    }

    return group
  }

  const createRotationHandlers = (platformRef: React.MutableRefObject<THREE.Group | null>) => {
    const isDraggingRef = { current: false }
    const previousMousePositionRef = { current: { x: 0, y: 0 } }

    const handlePointerDown = (e: PointerEvent) => {
      isDraggingRef.current = true
      previousMousePositionRef.current = {
        x: e.clientX,
        y: e.clientY,
      }
    }

    const handlePointerMove = (e: PointerEvent) => {
      if (!isDraggingRef.current || !platformRef.current) return

      const deltaX = e.clientX - previousMousePositionRef.current.x
      const rotationSpeed = 0.01
      const rotationDelta = deltaX * rotationSpeed

      platformRef.current.rotation.y += rotationDelta

      previousMousePositionRef.current = {
        x: e.clientX,
        y: e.clientY,
      }
    }

    const handlePointerUp = () => {
      isDraggingRef.current = false
    }

    return { handlePointerDown, handlePointerMove, handlePointerUp }
  }

  useEffect(() => {
    if (!maleContainerRef.current) return

    const initMaleScene = async () => {
      const scene = new THREE.Scene()
      scene.background = new THREE.Color(0xffffff)
      maleSceneRef.current = scene

      const camera = new THREE.PerspectiveCamera(
        50,
        maleContainerRef.current!.clientWidth / maleContainerRef.current!.clientHeight,
        0.1,
        1000,
      )
      camera.position.set(0, 1.3, 3.5)
      camera.lookAt(0, 0.3, 0)
      maleCameraRef.current = camera

      const renderer = new THREE.WebGLRenderer({ antialias: true })
      renderer.setSize(maleContainerRef.current!.clientWidth, maleContainerRef.current!.clientHeight)
      renderer.setPixelRatio(window.devicePixelRatio)
      maleContainerRef.current!.appendChild(renderer.domElement)
      maleRendererRef.current = renderer

      // Lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
      scene.add(ambientLight)

      const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0)
      directionalLight.position.set(5, 10, 5)
      scene.add(directionalLight)

      const fillLight = new THREE.DirectionalLight(0xffffff, 0.4)
      fillLight.position.set(-5, 5, -5)
      scene.add(fillLight)

      const backLight = new THREE.DirectionalLight(0xffffff, 0.3)
      backLight.position.set(0, 5, -5)
      scene.add(backLight)

      // Create platform
      const platform = createPlatform()
      scene.add(platform)
      malePlatformRef.current = platform

      // Load male model
      const loadedModel = await loadGLBModel()
      if (loadedModel) {
        // Add model as child of platform so it rotates with platform
        platform.add(loadedModel)
      }

      // Animation loop
      const animate = () => {
        maleAnimationFrameRef.current = requestAnimationFrame(animate)
        renderer.render(scene, camera)
      }
      animate()

      // Rotation controls
      const { handlePointerDown, handlePointerMove, handlePointerUp } = createRotationHandlers(malePlatformRef)

      const canvas = renderer.domElement
      canvas.addEventListener("pointerdown", handlePointerDown)
      canvas.addEventListener("pointermove", handlePointerMove)
      canvas.addEventListener("pointerup", handlePointerUp)
      canvas.addEventListener("pointerleave", handlePointerUp)

      // Handle resize
      const handleResize = () => {
        if (!maleContainerRef.current || !maleCameraRef.current || !maleRendererRef.current) return
        maleCameraRef.current.aspect = maleContainerRef.current.clientWidth / maleContainerRef.current.clientHeight
        maleCameraRef.current.updateProjectionMatrix()
        maleRendererRef.current.setSize(maleContainerRef.current.clientWidth, maleContainerRef.current.clientHeight)
      }
      window.addEventListener("resize", handleResize)

      setIsLoading(false)

      return () => {
        window.removeEventListener("resize", handleResize)
        canvas.removeEventListener("pointerdown", handlePointerDown)
        canvas.removeEventListener("pointermove", handlePointerMove)
        canvas.removeEventListener("pointerup", handlePointerUp)
        canvas.removeEventListener("pointerleave", handlePointerUp)

        if (maleAnimationFrameRef.current) {
          cancelAnimationFrame(maleAnimationFrameRef.current)
        }
        if (maleContainerRef.current && renderer.domElement && maleContainerRef.current.contains(renderer.domElement)) {
          maleContainerRef.current.removeChild(renderer.domElement)
        }
        maleRendererRef.current?.dispose()
      }
    }

    const cleanup = initMaleScene()
    return () => {
      cleanup.then((cleanupFn) => cleanupFn?.())
    }
  }, [])

  useEffect(() => {
    if (!femaleContainerRef.current) return

    const initFemaleScene = async () => {
      const scene = new THREE.Scene()
      scene.background = new THREE.Color(0xffffff)
      femaleSceneRef.current = scene

      const camera = new THREE.PerspectiveCamera(
        50,
        femaleContainerRef.current!.clientWidth / femaleContainerRef.current!.clientHeight,
        0.1,
        1000,
      )
      camera.position.set(0, 1.3, 3.5)
      camera.lookAt(0, 0.3, 0)
      femaleCameraRef.current = camera

      const renderer = new THREE.WebGLRenderer({ antialias: true })
      renderer.setSize(femaleContainerRef.current!.clientWidth, femaleContainerRef.current!.clientHeight)
      renderer.setPixelRatio(window.devicePixelRatio)
      femaleContainerRef.current!.appendChild(renderer.domElement)
      femaleRendererRef.current = renderer

      // Lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
      scene.add(ambientLight)

      const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0)
      directionalLight.position.set(5, 10, 5)
      scene.add(directionalLight)

      const fillLight = new THREE.DirectionalLight(0xffffff, 0.4)
      fillLight.position.set(-5, 5, -5)
      scene.add(fillLight)

      const backLight = new THREE.DirectionalLight(0xffffff, 0.3)
      backLight.position.set(0, 5, -5)
      scene.add(backLight)

      // Create platform
      const platform = createPlatform()
      scene.add(platform)
      femalePlatformRef.current = platform

      // Create female model
      const femaleModel = createRealisticHumanoid("female")

      // Position model on platform
      const box = new THREE.Box3().setFromObject(femaleModel)
      const bottomY = box.min.y
      femaleModel.position.y = -0.475 - bottomY

      // Add model as child of platform so it rotates with platform
      platform.add(femaleModel)

      // Animation loop
      const animate = () => {
        femaleAnimationFrameRef.current = requestAnimationFrame(animate)
        renderer.render(scene, camera)
      }
      animate()

      // Rotation controls
      const { handlePointerDown, handlePointerMove, handlePointerUp } = createRotationHandlers(femalePlatformRef)

      const canvas = renderer.domElement
      canvas.addEventListener("pointerdown", handlePointerDown)
      canvas.addEventListener("pointermove", handlePointerMove)
      canvas.addEventListener("pointerup", handlePointerUp)
      canvas.addEventListener("pointerleave", handlePointerUp)

      // Handle resize
      const handleResize = () => {
        if (!femaleContainerRef.current || !femaleCameraRef.current || !femaleRendererRef.current) return
        femaleCameraRef.current.aspect =
          femaleContainerRef.current.clientWidth / femaleContainerRef.current.clientHeight
        femaleCameraRef.current.updateProjectionMatrix()
        femaleRendererRef.current.setSize(
          femaleContainerRef.current.clientWidth,
          femaleContainerRef.current.clientHeight,
        )
      }
      window.addEventListener("resize", handleResize)

      return () => {
        window.removeEventListener("resize", handleResize)
        canvas.removeEventListener("pointerdown", handlePointerDown)
        canvas.removeEventListener("pointermove", handlePointerMove)
        canvas.removeEventListener("pointerup", handlePointerUp)
        canvas.removeEventListener("pointerleave", handlePointerUp)

        if (femaleAnimationFrameRef.current) {
          cancelAnimationFrame(femaleAnimationFrameRef.current)
        }
        if (
          femaleContainerRef.current &&
          renderer.domElement &&
          femaleContainerRef.current.contains(renderer.domElement)
        ) {
          femaleContainerRef.current.removeChild(renderer.domElement)
        }
        femaleRendererRef.current?.dispose()
      }
    }

    const cleanup = initFemaleScene()
    return () => {
      cleanup.then((cleanupFn) => cleanupFn?.())
    }
  }, [])

  return (
    <div className="relative h-screen w-full">
      <div
        ref={maleContainerRef}
        className="absolute inset-0 touch-none"
        style={{
          cursor: "grab",
          visibility: activeModel === "male" ? "visible" : "hidden",
          pointerEvents: activeModel === "male" ? "auto" : "none",
        }}
      />

      <div
        ref={femaleContainerRef}
        className="absolute inset-0 touch-none"
        style={{
          cursor: "grab",
          visibility: activeModel === "female" ? "visible" : "hidden",
          pointerEvents: activeModel === "female" ? "auto" : "none",
        }}
      />

      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 text-sm text-muted-foreground z-10">
          Загрузка модели...
        </div>
      )}

      {/* Control buttons */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-4 bg-background/70 backdrop-blur-sm p-2 rounded-lg shadow-lg">
        <Button
          variant={activeModel === "male" ? "default" : "outline"}
          onClick={() => setActiveModel("male")}
          className="min-w-32 rounded-none"
          disabled={isLoading}
        >
          Мужчина
        </Button>
        <Button
          variant={activeModel === "female" ? "default" : "outline"}
          onClick={() => setActiveModel("female")}
          className="min-w-32 rounded-none"
          disabled={isLoading}
        >
          Женщина
        </Button>
      </div>
    </div>
  )
}

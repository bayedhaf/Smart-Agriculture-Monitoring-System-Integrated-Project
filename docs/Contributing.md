# Contributing Guidelines & Code Standards

## Code Quality Standards

### TypeScript

```typescript
// ✅ GOOD - Explicit types
interface Farm {
  id: string;
  name: string;
  area: number;
  cropType: string;
  createdAt: Date;
}

const createFarm = (farmData: Farm): Promise<Farm> => {
  // implementation
};

// ❌ BAD - Any types
const createFarm = (farmData: any): any => {
  // implementation
};
```

### React/Next.js Best Practices

#### Components

```typescript
// ✅ GOOD - Functional component with proper structure
'use client';
import { ReactNode } from 'react';

interface SensorCardProps {
  sensorId: string;
  temperature: number;
  humidity: number;
  isLoading?: boolean;
}

export function SensorCard({
  sensorId,
  temperature,
  humidity,
  isLoading = false,
}: SensorCardProps) {
  return (
    <div className="card">
      {isLoading ? (
        <Spinner />
      ) : (
        <>
          <h3>{sensorId}</h3>
          <p>Temp: {temperature}°C</p>
          <p>Humidity: {humidity}%</p>
        </>
      )}
    </div>
  );
}

// ❌ BAD - Using defaultProps, no prop types
const SensorCard = ({ sensorId, temperature, humidity, isLoading }) => {
  // ...
};
SensorCard.defaultProps = {
  isLoading: false,
};
```

#### Hooks

```typescript
// ✅ GOOD - Custom hook with proper error handling
export const useFarms = (userId: string) => {
  const [farms, setFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchFarms = async () => {
      try {
        setLoading(true);
        const data = await farmsApi.getFarms(userId);
        setFarms(data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchFarms();
  }, [userId]);

  return { farms, loading, error };
};

// ❌ BAD - Not returning error state
const useFarms = (userId) => {
  const [farms, setFarms] = useState([]);
  useEffect(() => {
    farmsApi.getFarms(userId).then(setFarms);
  }, [userId]);
  return farms;
};
```

#### Conditional Rendering

```typescript
// ✅ GOOD - Clear conditions
{isLoading && <Spinner />}
{error && <ErrorAlert message={error.message} />}
{!isLoading && !error && farms.length > 0 && (
  <FarmsList farms={farms} />
)}

// ❌ BAD - Unclear ternaries
{isLoading ? <Spinner /> : farms.length > 0 ? <FarmsList /> : <Empty />}
```

### Express Backend Standards

#### Controllers

```typescript
// ✅ GOOD - Error handling, proper HTTP status
export const getFarms = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = (req as AuthRequest).user.uid;
    const farms = await farmsService.getFarmsByUserId(userId);

    res.json({
      success: true,
      data: { farms },
      message: "Farms retrieved successfully",
    });
  } catch (error) {
    next(error);
  }
};

// ❌ BAD - No error handling, inconsistent response
const getFarms = (req, res) => {
  const farms = farmsService.getFarmsByUserId(req.user.uid);
  res.send(farms);
};
```

#### Services

```typescript
// ✅ GOOD - Business logic separated, proper error messages
export class FarmsService {
  async getFarmsByUserId(userId: string): Promise<Farm[]> {
    if (!userId) {
      throw new ValidationError("userId is required");
    }

    const farmsRef = db.ref(`farms`);
    const snapshot = await farmsRef
      .orderByChild("userId")
      .equalTo(userId)
      .once("value");

    if (!snapshot.exists()) {
      return [];
    }

    return Object.values(snapshot.val());
  }

  async createFarm(farmData: CreateFarmInput, userId: string): Promise<Farm> {
    const validation = validateFarmData(farmData);
    if (!validation.valid) {
      throw new ValidationError(validation.errors);
    }

    const farmRef = db.ref(`farms`).push();
    const farm: Farm = {
      id: farmRef.key!,
      ...farmData,
      userId,
      createdAt: new Date(),
    };

    await farmRef.set(farm);
    return farm;
  }
}

// ❌ BAD - Business logic mixed with DB calls
const getFarms = (userId) => {
  return db.ref(`farms/${userId}`).once("value");
};
```

### File Naming Conventions

```
✅ GOOD:
/components/FarmCard.tsx
/components/farm-card.tsx (alternative)
/services/farmsService.ts
/utils/validators.ts
/hooks/useFarms.ts
/types/index.ts

❌ BAD:
/components/farmCard.tsx (inconsistent with folder)
/services/FarmsService.ts (unless class)
/utils/Validators.ts (should be lowercase)
/hooks/farmhook.ts (unclear)
```

### CSS & Styling

```typescript
// ✅ GOOD - Tailwind utilities
<div className="flex items-center gap-4 p-6 bg-gray-50 rounded-lg border">
  <Image src={...} alt="..." className="w-16 h-16" />
  <div>
    <h3 className="text-lg font-semibold text-gray-900">Farm Name</h3>
    <p className="text-sm text-gray-600">Location</p>
  </div>
</div>

// ❌ BAD - Custom CSS, hardcoded styles
<div style={{
  display: 'flex',
  padding: '24px',
  backgroundColor: '#f3f4f6',
  borderRadius: '8px',
  border: '1px solid #e5e7eb'
}}>
  ...
</div>
```

### Error Handling

```typescript
// ✅ GOOD - Custom error classes
export class CustomError extends Error {
  constructor(
    public code: string,
    public message: string,
    public statusCode: number = 500,
    public details?: any,
  ) {
    super(message);
  }
}

export class ValidationError extends CustomError {
  constructor(details: any) {
    super("VALIDATION_ERROR", "Invalid input", 400, details);
  }
}

// ❌ BAD - Generic errors
throw new Error("Something went wrong");
throw Error("Farm not found");
```

### Database Operations (Firebase)

```typescript
// ✅ GOOD - Type safety, error handling
const getFarmById = async (farmId: string): Promise<Farm> => {
  if (!farmId) {
    throw new ValidationError("farmId is required");
  }

  const snapshot = await db.ref(`farms/${farmId}`).once("value");

  if (!snapshot.exists()) {
    throw new NotFoundError(`Farm ${farmId} not found`);
  }

  return snapshot.val() as Farm;
};

// ❌ BAD - No validation, unclear response
const getFarmById = (farmId) => {
  return db
    .ref(`farms/${farmId}`)
    .once("value")
    .then((s) => s.val());
};
```

### Logging Standards

```typescript
// ✅ GOOD - Structured logging with context
import logger from "./logger";

logger.info("Processing sensor data", {
  sensorId: sensor.id,
  farmId: sensor.farmId,
  dataPoints: readings.length,
  timestamp: new Date().toISOString(),
});

logger.error("Failed to process sensor data", {
  error: error.message,
  sensorId: sensor.id,
  stack: error.stack,
});

// ❌ BAD - Console.log
console.log("Sensor data:", data);
console.log("Error:", error);
```

### API Response Standards

```typescript
// ✅ GOOD - Consistent response format
res.json({
  success: true,
  data: {
    farms: [...]
  },
  message: 'Farms retrieved successfully',
  timestamp: new Date().toISOString()
});

// Error response
res.status(400).json({
  success: false,
  error: {
    code: 'VALIDATION_ERROR',
    message: 'Invalid input',
    details: { email: 'Invalid email format' }
  },
  timestamp: new Date().toISOString()
});

// ❌ BAD - Inconsistent format
res.json(farms);  // No metadata
res.json({ error: 'Something went wrong' });  // Inconsistent structure
```

### Testing Standards

```typescript
// ✅ GOOD - Clear test structure
describe("FarmsService", () => {
  let service: FarmsService;

  beforeEach(() => {
    service = new FarmsService();
  });

  describe("getFarmsByUserId", () => {
    it("should return farms for valid user", async () => {
      const farms = await service.getFarmsByUserId("user123");
      expect(farms).toBeInstanceOf(Array);
      expect(farms.length).toBeGreaterThan(0);
    });

    it("should throw error for invalid userId", async () => {
      expect(() => service.getFarmsByUserId("")).toThrow();
    });
  });
});

// ❌ BAD - Unclear test
it("works", () => {
  const result = service.getFarmsByUserId("user123");
  expect(result).toBeTruthy();
});
```

## Git Workflow

### Branch Naming

```
✅ GOOD:
feature/add-disease-detection
feature/improve-dashboard-performance
bugfix/fix-alert-notification-timing
docs/update-api-documentation
refactor/extract-common-hooks

❌ BAD:
feature/stuff
fix_bug
new-feature
update
v1
```

### Commit Messages

```
✅ GOOD:
feat(disease): Add Roboflow AI integration for crop disease detection
fix(alerts): Fix alert threshold comparison logic for soil moisture
docs(api): Update API documentation for sensor endpoints
refactor(hooks): Extract common Firebase subscription logic
chore(deps): Update express to 4.18.2

Format: type(scope): description

Types: feat, fix, docs, style, refactor, test, chore, ci, perf
```

### Pull Request Process

1. Create feature branch from `develop`
2. Make atomic commits with clear messages
3. Write PR description with:
   - What changed
   - Why it changed
   - How to test
4. Link related issues
5. Ensure CI/CD passes
6. Request code review (min 1 approval)
7. Merge to develop
8. Delete branch

### Code Review Checklist

- [ ] Code follows style guide
- [ ] No TypeScript errors
- [ ] Tests are included
- [ ] Documentation updated
- [ ] No hardcoded values
- [ ] Error handling present
- [ ] Performance considered
- [ ] Security implications reviewed

## Documentation Standards

### Component Documentation

```typescript
/**
 * Displays a single sensor's current data and status
 *
 * @component
 * @example
 * const sensor = { id: 's1', name: 'North', temp: 28.5, humidity: 65 }
 * return <SensorCard sensor={sensor} onRefresh={() => {}} />
 *
 * @param {Object} props - Component props
 * @param {Sensor} props.sensor - Sensor data object
 * @param {() => void} props.onRefresh - Callback to refresh data
 * @returns {JSX.Element} Rendered sensor card
 */
export function SensorCard({ sensor, onRefresh }: SensorCardProps) {
  // ...
}
```

### Function Documentation

```typescript
/**
 * Calculate average temperature from sensor readings
 *
 * @param {SensorReading[]} readings - Array of sensor readings
 * @param {number} [minConfidence=0.8] - Minimum confidence threshold
 * @returns {number} Average temperature in Celsius
 * @throws {ValidationError} If readings array is empty
 *
 * @example
 * const avg = calculateAverageTemp(readings)
 */
export const calculateAverageTemp = (
  readings: SensorReading[],
  minConfidence = 0.8,
): number => {
  // ...
};
```

## Performance Best Practices

### Frontend

```typescript
// ✅ GOOD - Memoization
const FarmCard = React.memo(({ farm }: { farm: Farm }) => {
  return <div>{farm.name}</div>;
});

// ✅ GOOD - Code splitting
const DiseaseDashboard = dynamic(
  () => import('@/components/disease-dashboard'),
  { loading: () => <Spinner /> }
);

// ❌ BAD - Re-rendering everything
export function FarmsList({ farms }: { farms: Farm[] }) {
  return farms.map(farm => <div>{farm.name}</div>);
}
```

### Backend

```typescript
// ✅ GOOD - Caching
const cachedFarms = new Map<string, Farm[]>();

const getFarmsWithCache = async (userId: string) => {
  if (cachedFarms.has(userId)) {
    return cachedFarms.get(userId);
  }
  const farms = await db.ref(`farms`).once("value");
  cachedFarms.set(userId, farms);
  return farms;
};

// ✅ GOOD - Batch operations
const batchInsertSensorData = async (data: SensorReading[]) => {
  const updates: Record<string, any> = {};
  data.forEach((reading, index) => {
    updates[`readings/${index}`] = reading;
  });
  return db.ref("sensorData").update(updates);
};
```

## Security Best Practices

```typescript
// ✅ GOOD - Input validation
export const createFarm = async (req: Request, res: Response) => {
  const validation = await validateFarmInput(req.body);
  if (!validation.valid) {
    return res.status(400).json({
      error: validation.errors,
    });
  }
  // process
};

// ✅ GOOD - Environment variables
const apiKey = process.env.ROBOFLOW_API_KEY;
if (!apiKey) {
  throw new Error("ROBOFLOW_API_KEY is not set");
}

// ❌ BAD - Hardcoded secrets
const apiKey = "sk-123456789";

// ❌ BAD - No validation
app.post("/farms", (req, res) => {
  const farm = req.body;
  db.ref("farms").push(farm);
});
```

## Tools & Setup

### Required Tools

- Node.js 18+
- pnpm (package manager)
- VS Code with extensions:
  - ESLint
  - Prettier
  - TypeScript Vue Plugin
  - Thunder Client / REST Client

### Pre-commit Hooks

```bash
# Using husky (runs tests & linting before commit)
npm install husky --save-dev
npx husky install
npx husky add .husky/pre-commit "pnpm lint && pnpm test"
```

### VS Code Settings

```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

## Contact & Questions

- **Tech Lead**: [contact]
- **Code Review Questions**: Create discussion in PR
- **Architecture Questions**: See ARCHITECTURE.md or discuss in team meeting
- **Performance Issues**: File issue with `perf:` prefix

---

Thank you for contributing to SMART Agriculture Monitoring System! 🌾

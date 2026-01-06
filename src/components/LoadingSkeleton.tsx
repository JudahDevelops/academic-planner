import { motion } from 'framer-motion';

interface LoadingSkeletonProps {
  variant?: 'card' | 'list' | 'text' | 'circle';
  count?: number;
  className?: string;
}

export function LoadingSkeleton({ variant = 'card', count = 1, className = '' }: LoadingSkeletonProps) {
  const shimmer = {
    backgroundSize: '200% 100%',
    backgroundImage: 'linear-gradient(90deg, #f0f0f0 0%, #e0e0e0 50%, #f0f0f0 100%)',
  };

  const CardSkeleton = () => (
    <div className={`bg-white rounded-xl border border-gray-100 p-6 ${className}`}>
      <div className="flex items-start gap-4">
        <motion.div
          className="w-12 h-12 rounded-lg"
          style={shimmer}
          animate={{
            backgroundPosition: ['200% 0', '-200% 0'],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
        <div className="flex-1">
          <motion.div
            className="h-5 w-3/4 rounded mb-3"
            style={shimmer}
            animate={{
              backgroundPosition: ['200% 0', '-200% 0'],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
          <motion.div
            className="h-4 w-1/2 rounded"
            style={shimmer}
            animate={{
              backgroundPosition: ['200% 0', '-200% 0'],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'linear',
              delay: 0.1,
            }}
          />
        </div>
      </div>
    </div>
  );

  const ListSkeleton = () => (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: 3 }).map((_, i) => (
        <motion.div
          key={i}
          className="h-16 rounded-lg"
          style={shimmer}
          animate={{
            backgroundPosition: ['200% 0', '-200% 0'],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'linear',
            delay: i * 0.1,
          }}
        />
      ))}
    </div>
  );

  const TextSkeleton = () => (
    <div className={`space-y-2 ${className}`}>
      <motion.div
        className="h-4 w-full rounded"
        style={shimmer}
        animate={{
          backgroundPosition: ['200% 0', '-200% 0'],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
      <motion.div
        className="h-4 w-5/6 rounded"
        style={shimmer}
        animate={{
          backgroundPosition: ['200% 0', '-200% 0'],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'linear',
          delay: 0.1,
        }}
      />
      <motion.div
        className="h-4 w-4/6 rounded"
        style={shimmer}
        animate={{
          backgroundPosition: ['200% 0', '-200% 0'],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'linear',
          delay: 0.2,
        }}
      />
    </div>
  );

  const CircleSkeleton = () => (
    <motion.div
      className={`w-12 h-12 rounded-full ${className}`}
      style={shimmer}
      animate={{
        backgroundPosition: ['200% 0', '-200% 0'],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: 'linear',
      }}
    />
  );

  const renderSkeleton = () => {
    switch (variant) {
      case 'list':
        return <ListSkeleton />;
      case 'text':
        return <TextSkeleton />;
      case 'circle':
        return <CircleSkeleton />;
      default:
        return <CardSkeleton />;
    }
  };

  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={i > 0 ? 'mt-4' : ''}>
          {renderSkeleton()}
        </div>
      ))}
    </>
  );
}

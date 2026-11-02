import { Fragment, type ComponentProps, type ReactNode } from 'react';
import { cn } from 'cn';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import Link from 'next/link';
import { Container } from './container';

export const PageHeader = ({
  title,
  description,
  slotRight,
  breadcrumb,
  titleAs: Title = 'h1',
  className,
  ...props
}: ComponentProps<'div'> & {
  title: ReactNode;
  description?: ReactNode;
  slotRight?: ReactNode;
  breadcrumb?: { label: string; path?: string }[];
  titleAs?: 'h1' | 'h2' | 'h3';
}) => {
  return (
    <Container>
      <div
        className={cn('flex items-center justify-between py-8', className)}
        {...props}
      >
        <div className="flex flex-col gap-1">
          {breadcrumb && (
            <Breadcrumb className="mb-1">
              <BreadcrumbList>
                {breadcrumb.map((crumb, i) => (
                  <Fragment key={i}>
                    <BreadcrumbItem>
                      {crumb.path ? (
                        <BreadcrumbLink asChild>
                          <Link href={crumb.path}>{crumb.label}</Link>
                        </BreadcrumbLink>
                      ) : (
                        <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                      )}
                    </BreadcrumbItem>
                    {i < breadcrumb.length - 1 && <BreadcrumbSeparator />}
                  </Fragment>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          )}

          <Title>{title}</Title>
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>
        {slotRight && (
          <div className="flex items-center gap-2">{slotRight}</div>
        )}
      </div>
    </Container>
  );
};

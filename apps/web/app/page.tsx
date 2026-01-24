import { APP_NAME } from '@repo/shared';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
} from '@repo/ui';

export default function HomePage() {
  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Header */}
        <header className="text-center">
          <h1 className="font-display text-4xl font-bold text-primary-700">
            {APP_NAME}
          </h1>
          <p className="mt-2 text-neutral-600">
            Službena web stranica Općine Veliki Bukovec
          </p>
        </header>

        {/* Button Variants */}
        <Card>
          <CardHeader>
            <CardTitle>Button Variants</CardTitle>
            <CardDescription>All available button styles</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Danger</Button>
            <Button variant="link">Link</Button>
          </CardContent>
        </Card>

        {/* Button Sizes */}
        <Card>
          <CardHeader>
            <CardTitle>Button Sizes</CardTitle>
            <CardDescription>Small, medium, and large sizes</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center gap-4">
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
          </CardContent>
        </Card>

        {/* Form Elements */}
        <Card>
          <CardHeader>
            <CardTitle>Form Elements</CardTitle>
            <CardDescription>Input and label components</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" required>
                Email
              </Label>
              <Input id="email" type="email" placeholder="ime@primjer.hr" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="error-input">Input with error</Label>
              <Input id="error-input" error placeholder="Invalid input" />
            </div>
          </CardContent>
        </Card>

        {/* Typography Demo */}
        <Card>
          <CardHeader>
            <CardTitle>Typography</CardTitle>
            <CardDescription>Font families and sizes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="font-display text-2xl font-bold">
              Plus Jakarta Sans (Display)
            </p>
            <p className="font-sans text-base">
              Inter (Body text) - Lorem ipsum dolor sit amet, consectetur
              adipiscing elit. Sed do eiusmod tempor incididunt ut labore.
            </p>
          </CardContent>
        </Card>

        {/* Color Palette */}
        <Card>
          <CardHeader>
            <CardTitle>Color Palette</CardTitle>
            <CardDescription>Brand and semantic colors</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 gap-2">
              <div className="h-12 rounded bg-primary-500" title="Primary 500" />
              <div className="h-12 rounded bg-primary-600" title="Primary 600" />
              <div className="h-12 rounded bg-primary-700" title="Primary 700" />
              <div className="h-12 rounded bg-accent-500" title="Accent 500" />
              <div className="h-12 rounded bg-neutral-500" title="Neutral 500" />
            </div>
            <div className="mt-4 grid grid-cols-4 gap-2">
              <div className="h-8 rounded bg-success" title="Success" />
              <div className="h-8 rounded bg-warning" title="Warning" />
              <div className="h-8 rounded bg-error" title="Error" />
              <div className="h-8 rounded bg-info" title="Info" />
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

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

        {/* Varijante gumba */}
        <Card>
          <CardHeader>
            <CardTitle>Varijante gumba</CardTitle>
            <CardDescription>Dostupni stilovi gumba</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            <Button variant="primary">Primarni</Button>
            <Button variant="secondary">Sekundarni</Button>
            <Button variant="outline">Obrub</Button>
            <Button variant="ghost">Prozirni</Button>
            <Button variant="danger">Opasnost</Button>
            <Button variant="link">Poveznica</Button>
          </CardContent>
        </Card>

        {/* Veličine gumba */}
        <Card>
          <CardHeader>
            <CardTitle>Veličine gumba</CardTitle>
            <CardDescription>Mala, srednja i velika veličina</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center gap-4">
            <Button size="sm">Mali</Button>
            <Button size="md">Srednji</Button>
            <Button size="lg">Veliki</Button>
          </CardContent>
        </Card>

        {/* Elementi obrasca */}
        <Card>
          <CardHeader>
            <CardTitle>Elementi obrasca</CardTitle>
            <CardDescription>Komponente za unos i oznake</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" required>
                Email
              </Label>
              <Input id="email" type="email" placeholder="ime@primjer.hr" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="error-input">Unos s greškom</Label>
              <Input id="error-input" error placeholder="Neispravan unos" />
            </div>
          </CardContent>
        </Card>

        {/* Tipografija */}
        <Card>
          <CardHeader>
            <CardTitle>Tipografija</CardTitle>
            <CardDescription>Obitelji fontova i veličine</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="font-display text-2xl font-bold">
              Plus Jakarta Sans (naslovni font)
            </p>
            <p className="font-sans text-base">
              Inter (tekst sadržaja) - Lorem ipsum dolor sit amet, consectetur
              adipiscing elit. Sed do eiusmod tempor incididunt ut labore.
            </p>
          </CardContent>
        </Card>

        {/* Paleta boja */}
        <Card>
          <CardHeader>
            <CardTitle>Paleta boja</CardTitle>
            <CardDescription>Brend i semantičke boje</CardDescription>
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

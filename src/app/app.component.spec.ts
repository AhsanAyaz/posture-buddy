import { TestBed, waitForAsync } from "@angular/core/testing";
import { RouterTestingModule } from "@angular/router/testing";
import { AppComponent } from "./app.component";
import { TranslateModule } from "@ngx-translate/core";
import { ElectronService } from "./core/services";
import { SharedModule } from "./shared/shared.module";

describe("AppComponent", () => {
  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [AppComponent],
        providers: [ElectronService],
        imports: [RouterTestingModule, TranslateModule.forRoot(), SharedModule],
      }).compileComponents();
    })
  );

  it(
    "should create the app",
    waitForAsync(() => {
      const fixture = TestBed.createComponent(AppComponent);
      const app = fixture.debugElement.componentInstance;
      expect(app).toBeTruthy();
    })
  );
});
